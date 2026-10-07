/* @layer bridge-wasm @kind logic */
/**
 * One NetworkStatus snapshot, built from the session's status, the packet facts
 * (network-facts.ts), the room state, the ping, the presence counts, the tracker links'
 * progress and two reads of the game (the received index and whether a file is in play).
 */
import { AP_WORLD_VERSION } from '@shared/randomizer/archipelago/ap-game';
import { buildNetworkPlayers } from './network-players';
import type { NameTables } from './ap-names';
import type { NetworkFacts } from './network-facts';
import type { Pinger } from './network-ping';
import type { Presence } from './network-presence';
import type {
  NetworkChecksum, NetworkPermissions, NetworkState, NetworkStatus, PermissionMode,
} from './network-status.type';
import type { OnlineCore } from './online-core.type';
import type { OnlineRoom } from './online-room';
import type { OnlineSessionConfig } from './online-session-config.type';
import type { RandomizerSession } from './session.type';
import type { TrackerLinks } from './tracker-links';

interface NetworkStatusInput {
  sessionStatus: RandomizerSession['status'];
  config: OnlineSessionConfig;
  facts: NetworkFacts;
  room: OnlineRoom;
  names: NameTables;
  core: Pick<OnlineCore, 'readReceivedIndex' | 'isFileInPlay'>;
  ping: Pick<Pinger, 'lastMs' | 'meanMs' | 'samples'>;
  presence: Pick<Presence, 'onlineOf' | 'statusOf'>;
  trackers: Pick<TrackerLinks, 'progressOf'>;
}

const STATE_OF_STATUS: Readonly<Record<RandomizerSession['status'], NetworkState>> = {
  idle: 'idle',
  starting: 'connecting',
  active: 'connected',
  reconnecting: 'reconnecting',
  error: 'error',
};

const PERMISSION_MODES: Readonly<Record<number, PermissionMode>> = {
  0: 'disabled', 1: 'enabled', 2: 'goal', 6: 'auto', 7: 'auto-enabled',
};

const modeOf = (value: number | undefined): PermissionMode =>
  (value === undefined ? 'unknown' : PERMISSION_MODES[value] ?? 'unknown');

const permissionsOf = (raw: Record<string, number> | null): NetworkPermissions | null =>
  (raw === null ? null : { release: modeOf(raw.release), collect: modeOf(raw.collect), remaining: modeOf(raw.remaining) });

/** The server's own formula: a percentage of the slot's locations, never under one point. */
const hintCostPoints = (percent: number | null, total: number): number | null => {
  if (percent === null || total === 0) return null;
  return percent > 0 ? Math.max(1, Math.floor(percent * 0.01 * total)) : 0;
};

/** A game the client did not ask for was served from the cache under the room's checksum. */
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
      // Handed on and not granted yet: the run in a row, the positions handed ahead of it, less
      // the ones among them the game already granted.
      queuedItems: Math.max(0, room.cursor.queued - receivedIndex + room.cursor.handed.size - room.cursor.settled.size),
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
export type { NetworkStatusInput };
