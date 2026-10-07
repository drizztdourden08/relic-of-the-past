/* @layer bridge-wasm @kind logic */
/**
 * Online randomizer session: speaks the multiworld protocol over a WebSocket.
 * Handshake: RoomInfo → GetDataPackage → DataPackage → Connect → Connected,
 * then scout-first override arming (see online-overrides.ts) and live location
 * polling. Caller-initiated stop routes through socket.close() so both stop
 * paths share the onclose cleanup.
 */

import { log } from '../../log-bus';
import { armReceiptGates, disarmReceiptGates } from '../receipt-grants';
import { clear as clearDeliveryQueue } from '../delivery-queue';
import { clearItemOverrides } from '../randomizer';
import { clearNpcGrantOverrides } from '../npc-grant-overrides';
import { clearDropOverrides } from '../drop-overrides';
import { clearScriptedGrantOverrides } from '../scripted-grant-overrides';
import { clearStandingOverrides } from '../standing-overrides';
import { disarmPrizeShuffle } from '../prize-shuffle';
import { armDungeonItemGrants, disarmDungeonItemGrants } from '../dungeon-item-grants';
import { clearSessionDialogue } from '../session-dialogue';
import { applyGearIcons, clearGearIcons } from '../gear-icons';
import { applyQuiverIcon, clearQuiverIcon } from '../quiver-icon';
import { applyCurrencySymbols, clearCurrencySymbols } from '../currency-symbols';
import { armCapacitySession, capacitySessionOf, disarmCapacitySession } from './capacity-session';
import { disarmItemBehavior } from './item-behavior-session';
import { composeCapacityLineMessages } from './capacity-rung-messages';
import { disarmPondSession } from './pond-session';
import { armFireReporting, disarmFireReporting } from './override-fire-registry';
import { startLocationPolling, stopLocationPolling } from './location-poller';
import { buildConnect, buildGetDataPackage, parseServerPackets } from './online-handshake';
import { applyScoutedLocations, buildScoutPlan, deliverReceivedItems } from './online-overrides';
import type { CapacityBonusSetting, CapacityProfile } from '@shared/randomizer/ap-world/capacity';
import type { ApClientPacket, ApGameData, ApServerPacket } from './ap-protocol.type';
import type { ScoutMaps } from './online-overrides';
import type { RandomizerSession, SessionStatusListener } from './session.type';

interface OnlineSessionConfig {
  url: string;
  slotName: string;
  /** Server-side game key; defaults to this app's own registered name. */
  game?: string;
  /** The profile's capacity settings (starting tiers, caps, wallet slots); absent = native grid. */
  capacity?: CapacityProfile;
  /** Custom families as progressive items: pickups climb the plan in order (absent = fixed jumps). */
  capacityProgressive?: boolean;
  /** What a capacity pickup hands over beside its ceiling (absent = the baselines). */
  capacityBonus?: CapacityBonusSetting;
}

interface OnlineSession extends RandomizerSession {
  readonly kind: 'online';
  onStatusChange(listener: SessionStatusListener): () => void;
}

const DEFAULT_GAME = 'Relic of the Past';

const createOnlineSession = (config: OnlineSessionConfig): OnlineSession => {
  const { url, slotName, game = DEFAULT_GAME, capacity, capacityProgressive = false, capacityBonus } = config;
  const listeners = new Set<SessionStatusListener>();
  const maps: ScoutMaps = {
    nameByLocationId: new Map(),
    locationIdByName: new Map(),
    overriddenLocationIds: new Set(),
  };
  let itemNameById = new Map<number, string>();
  let gameData: ApGameData | null = null;
  let socket: WebSocket | null = null;
  let status: RandomizerSession['status'] = 'idle';

  const setStatus = (next: RandomizerSession['status']): void => {
    status = next;
    for (const listener of listeners) {
      try { listener(next); } catch { /* never let a bad listener break the session */ }
    }
  };

  const send = (packet: ApClientPacket): void => {
    socket?.send(JSON.stringify([packet]));
  };

  const cleanup = (): void => {
    stopLocationPolling();
    disarmFireReporting();
    clearItemOverrides();
    clearNpcGrantOverrides();
    clearDropOverrides();
    clearStandingOverrides();
    clearScriptedGrantOverrides();
    disarmPrizeShuffle();
    disarmDungeonItemGrants();
    // An online world has no pond option of its own, so a session here always plays
    // the native pond, but a plan left armed by an earlier local session must not
    // survive into it.
    disarmPondSession();
    disarmCapacitySession();
    // Same reason as the pond: an online world decides item behaviour on the
    // server, so this session arms none of its own, but a ladder or an item-power
    // word left behind by an earlier local session must not survive into it.
    disarmItemBehavior();
    clearGearIcons();
    clearQuiverIcon();
    clearCurrencySymbols();
    // Drop still-queued deliveries with the session, because a closed session must not
    // leave receipt entries retrying forever (clear() resolves completions safely).
    clearDeliveryQueue();
    disarmReceiptGates();
    // Restore the baked dialogue blob, since the scouted and received lines go with it.
    clearSessionDialogue();
    maps.nameByLocationId.clear();
    maps.locationIdByName.clear();
    maps.overriddenLocationIds.clear();
    itemNameById = new Map();
    gameData = null;
    socket = null;
    if (status !== 'error') setStatus('idle');
    log.randomizer('[Online] Session closed');
  };

  const fail = (message: string): void => {
    log.randomizer(message, 'error');
    setStatus('error');
    socket?.close();
  };

  const handleDataPackage = (games: Record<string, ApGameData>): void => {
    const table = games[game];
    if (!table) {
      fail(`[Online] Server data package has no entry for ${game}`);
      return;
    }
    gameData = table;
    itemNameById = new Map(Object.entries(table.item_name_to_id).map(([name, id]) => [id, name]));
    send(buildConnect(game, slotName));
  };

  const handleConnected = (session: OnlineSession): void => {
    setStatus('active');
    if (!gameData) {
      fail('[Online] Connected before the data package arrived');
      return;
    }
    // Scout first: arm the dedup set for EVERY detectable location before the
    // scout is even sent, so replayed ReceivedItems cannot double-deliver.
    const { locationIds, pollEntries } = buildScoutPlan(gameData, maps);
    send({ cmd: 'LocationScouts', locations: locationIds, create_as_hint: 0 });
    // Physical rows report from the substitution seam; scout answers suppress
    // their polled detections as each override arms (online-overrides.ts).
    armFireReporting(session);
    startLocationPolling(session, pollEntries);
    log.randomizer(`[Online] Connected as ${slotName}; scouting ${locationIds.length} locations`);
  };

  const handlePacket = (packet: ApServerPacket, session: OnlineSession): void => {
    switch (packet.cmd) {
      case 'RoomInfo':
        send(buildGetDataPackage(game));
        break;
      case 'DataPackage':
        handleDataPackage(packet.data.games);
        break;
      case 'Connected':
        handleConnected(session);
        break;
      case 'ConnectionRefused':
        fail(`[Online] Connection refused: ${packet.errors.join(', ')}`);
        break;
      case 'ReceivedItems':
        deliverReceivedItems(packet.items, itemNameById, maps.overriddenLocationIds);
        break;
      case 'LocationInfo':
        applyScoutedLocations(packet.locations, itemNameById, maps);
        break;
      default:
        break; // Unhandled server chatter, ignored by design.
    }
  };

  const session: OnlineSession = {
    kind: 'online',
    get status() { return status; },

    async start() {
      setStatus('starting');
      // Arm before the socket even opens: scouted chest overrides substitute natively,
      // so the message gate must be latched before the first chest can open, and the
      // handshake takes long enough that one already could. cleanup() disarms on every
      // stop path (including a refused connection), so a failed start leaves no gate open.
      armReceiptGates();
      // Same reason, and more sharply here: the server hands over an assigned item at any
      // moment with no plan row behind it, so the dungeon-item seams must already be open.
      armDungeonItemGrants();
      if (capacity !== undefined) {
        const lines = composeCapacityLineMessages(capacity, capacityProgressive);
        await armCapacitySession(capacitySessionOf(capacity, capacityProgressive, capacityBonus), '[Online]', lines);
      }
      // A substituted blade or shield on a shelf, on the ground or on a pedestal draws in
      // the equipped gear's colours without these; the hold-up ceremony is untouched.
      await applyGearIcons('[Online]');
      // The quiver a retro seed hands over as an arrow draws as itself with this; the
      // core shows it only while the retro bow is armed.
      await applyQuiverIcon('[Online]');
      // A shelf priced in something other than rupees says so beside its digits with these.
      await applyCurrencySymbols('[Online]');
      log.randomizer(`[Online] Connecting to ${url}`);
      const ws = new WebSocket(url);
      socket = ws;
      ws.onmessage = (event) => {
        for (const packet of parseServerPackets(String(event.data))) handlePacket(packet, session);
      };
      ws.onerror = () => {
        log.randomizer('[Online] Socket error', 'error');
        setStatus('error');
      };
      ws.onclose = cleanup;
    },

    reportCheck(locationName) {
      log.randomizer(`[Online] Check completed: ${locationName}`);
      const locationId = maps.locationIdByName.get(locationName);
      if (locationId === undefined) return;
      send({ cmd: 'LocationChecks', locations: [locationId] });
    },

    stop() {
      if (socket) socket.close();
      else cleanup();
    },

    onStatusChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  return session;
};

export { createOnlineSession };
export type { OnlineSession, OnlineSessionConfig };
