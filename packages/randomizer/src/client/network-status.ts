/* @layer bridge-wasm @kind logic */
import { AP_WORLD_VERSION } from '../archipelago/ap-game';
import { buildNetworkPlayers } from './network-players';
import type { NetworkFacts } from './network-facts';
import type { OnlineRoom } from './online-room';
import type {
  NetworkChecksum, NetworkPermissions, NetworkStatus, NetworkStatusInput, PermissionMode,
} from './network-status.type';
import { MIN_PAID_HINT_COST, PERCENT, PERMISSION_MODES, STATE_OF_STATUS } from './network-status.constants';

const modeOf = (value: number | undefined): PermissionMode =>
  (value === undefined ? 'unknown' : PERMISSION_MODES[value] ?? 'unknown');

const permissionsOf = (raw: Record<string, number> | null): NetworkPermissions | null =>
  (raw === null ? null : { release: modeOf(raw.release), collect: modeOf(raw.collect), remaining: modeOf(raw.remaining) });

const hintCostPoints = (percent: number | null, total: number): number | null => {
  if (percent === null || total === 0) return null;
  return percent > 0 ? Math.max(MIN_PAID_HINT_COST, Math.floor(percent * PERCENT * total)) : 0;
};

const checksumsOf = (facts: NetworkFacts): NetworkChecksum[] =>
  Object.entries(facts.roomChecksums).map(([game, checksum]) => ({
    game,
    matched: !facts.requestedGames.has(game) || facts.fetchedChecksums.get(game) === checksum,
  }));

const sentToOthers = (facts: NetworkFacts, slot: number | null): number => {
  let count = 0;
  for (const id of facts.sentChecks) {
    const owner = facts.scoutOwners.get(id);
    if (owner !== undefined && owner !== slot) count += 1;
  }
  return count;
};

const itemsHandedNotGranted = (room: OnlineRoom, receivedIndex: number): number =>
  Math.max(0, room.cursor.queued - receivedIndex + room.cursor.handed.size - room.cursor.settled.size);

const buildNetworkStatus = (input: NetworkStatusInput): NetworkStatus => {
  const { sessionStatus, config, facts, room, names, core, ping, presence, trackers } = input;
  const receivedIndex = core.readReceivedIndex();
  const total = room.checked.size + room.missing.size;
  return {
    connection: {
      state: STATE_OF_STATUS[sessionStatus],
      configuredUrl: config.url,
      url: facts.url,
      seedName: facts.seedName,
      serverVersion: facts.serverVersion,
      generatorVersion: facts.generatorVersion,
      slot: room.slot,
      slotName: config.slotName,
      team: room.team,
      uuidShort: facts.uuid === null ? null : facts.uuid.split('-')[0],
      worldVersion: facts.worldVersion,
      appWorldVersion: AP_WORLD_VERSION,
      deathLink: facts.deathLink,
      passwordUsed: Boolean(config.password),
      connectedAt: room.connected ? facts.connectedAt : null,
      reconnectAttempt: sessionStatus === 'reconnecting' ? facts.reconnectAttempt : 0,
      nextRetryAt: sessionStatus === 'reconnecting' ? facts.nextRetryAt : null,
      retryInFlight: sessionStatus === 'reconnecting' && facts.retryInFlight,
      error: sessionStatus === 'error' || sessionStatus === 'reconnecting' ? facts.error : null,
    },
    health: {
      lastPacketAt: facts.lastPacketAt,
      packetsIn: facts.packetsIn,
      packetsOut: facts.packetsOut,
      pingMs: ping.lastMs,
      pingMeanMs: ping.meanMs,
      pingSamples: ping.samples,
      heldItems: room.heldReceived.reduce((sum, packet) => sum + (packet.items?.length ?? 0), 0),
      queuedItems: itemsHandedNotGranted(room, receivedIndex),
      receivedIndex,
      fileInPlay: core.isFileInPlay(),
    },
    players: buildNetworkPlayers(room, names, presence, trackers),
    server: {
      permissions: permissionsOf(facts.permissions),
      hintCostPercent: facts.hintCostPercent,
      hintCostPoints: hintCostPoints(facts.hintCostPercent, total),
      hintPoints: facts.hintPoints,
      locationCheckPoints: facts.locationCheckPoints,
      games: facts.games,
      checksums: checksumsOf(facts),
      passwordRequired: facts.passwordRequired,
    },
    progress: {
      checked: room.checked.size,
      total,
      itemsReceived: facts.itemsReceived,
      itemsSentToOthers: sentToOthers(facts, room.slot),
      goalReported: facts.goalReported,
    },
  };
};

export { buildNetworkStatus };
export type { NetworkStatusInput } from './network-status.type';
