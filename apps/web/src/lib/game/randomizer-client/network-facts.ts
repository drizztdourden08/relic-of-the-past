/* @layer bridge-wasm @kind logic */
/**
 * What the network section needs that the room state does not already hold, read off the
 * packets as they cross: counters, timestamps, the room's advertised settings, and which of
 * this client's reported checks held another player's item. Two observers, one per direction,
 * each a plain update of the facts.
 */
import { CLIENT_GOAL } from './online-goal';
import { DEATH_LINK_TAG } from './online-handshake';
import type { ApClientPacket, ApRoomUpdatePacket, ApServerPacket } from './ap-protocol.type';

interface NetworkFacts {
  url: string | null;
  seedName: string | null;
  serverVersion: string | null;
  generatorVersion: string | null;
  games: string[];
  roomChecksums: Record<string, string>;
  passwordRequired: boolean | null;
  permissions: Record<string, number> | null;
  hintCostPercent: number | null;
  locationCheckPoints: number | null;
  hintPoints: number | null;
  uuid: string | null;
  deathLink: boolean;
  worldVersion: string | null;
  connectedAt: number | null;
  lastPacketAt: number | null;
  packetsIn: number;
  packetsOut: number;
  /** Games asked for in GetDataPackage: every other game of the room came from the cache by checksum. */
  requestedGames: Set<string>;
  fetchedChecksums: Map<string, string | undefined>;
  itemsReceived: number;
  /** Location to the slot receiving its item, from the scout answer. */
  scoutOwners: Map<number, number>;
  sentChecks: Set<number>;
  goalReported: boolean;
  reconnectAttempt: number;
  nextRetryAt: number | null;
  /** A scheduled try is under way: its socket is opening or its slot is being accepted. */
  retryInFlight: boolean;
  error: string | null;
}

const createNetworkFacts = (): NetworkFacts => ({
  url: null, seedName: null, serverVersion: null, generatorVersion: null, games: [], roomChecksums: {},
  passwordRequired: null, permissions: null, hintCostPercent: null, locationCheckPoints: null, hintPoints: null,
  uuid: null, deathLink: false, worldVersion: null, connectedAt: null, lastPacketAt: null, packetsIn: 0,
  packetsOut: 0, requestedGames: new Set(), fetchedChecksums: new Map(), itemsReceived: 0, scoutOwners: new Map(),
  sentChecks: new Set(), goalReported: false, reconnectAttempt: 0, nextRetryAt: null, retryInFlight: false,
  error: null,
});

const versionText = (version: { major: number; minor: number; build: number } | undefined): string | null =>
  version && typeof version.major === 'number' ? `${version.major}.${version.minor}.${version.build}` : null;

type RoomSettings = Pick<ApRoomUpdatePacket, 'permissions' | 'hint_cost' | 'location_check_points' | 'hint_points'>;

const numberOr = (value: unknown, fallback: number | null): number | null =>
  (typeof value === 'number' ? value : fallback);

const worldVersionOf = (slotData: unknown): string | null => {
  const value = (slotData as { worldVersion?: unknown } | null)?.worldVersion;
  return typeof value === 'string' ? value : null;
};

/** The room's settings, from RoomInfo or the part of them a RoomUpdate changes. */
const observeSettings = (facts: NetworkFacts, packet: RoomSettings): void => {
  if (packet.permissions && typeof packet.permissions === 'object') facts.permissions = packet.permissions;
  facts.hintCostPercent = numberOr(packet.hint_cost, facts.hintCostPercent);
  facts.locationCheckPoints = numberOr(packet.location_check_points, facts.locationCheckPoints);
  facts.hintPoints = numberOr(packet.hint_points, facts.hintPoints);
};

const observeServer = (facts: NetworkFacts, packet: ApServerPacket, now: number): void => {
  facts.lastPacketAt = now;
  facts.packetsIn += 1;
  if (packet.cmd === 'RoomInfo') {
    facts.seedName = packet.seed_name ?? null;
    facts.serverVersion = versionText(packet.version);
    facts.generatorVersion = versionText(packet.generator_version);
    facts.games = Array.isArray(packet.games) ? [...packet.games] : [];
    facts.roomChecksums = packet.datapackage_checksums ?? {};
    facts.passwordRequired = typeof packet.password === 'boolean' ? packet.password : null;
    facts.requestedGames = new Set();
    observeSettings(facts, packet);
  } else if (packet.cmd === 'DataPackage') {
    for (const [game, data] of Object.entries(packet.data?.games ?? {})) facts.fetchedChecksums.set(game, data?.checksum);
  } else if (packet.cmd === 'Connected') {
    facts.connectedAt = now;
    facts.reconnectAttempt = 0;
    facts.nextRetryAt = null;
    facts.retryInFlight = false;
    facts.worldVersion = worldVersionOf(packet.slot_data);
    observeSettings(facts, packet);
  } else if (packet.cmd === 'RoomUpdate') {
    observeSettings(facts, packet);
  } else if (packet.cmd === 'ReceivedItems') {
    facts.itemsReceived = Math.max(facts.itemsReceived, packet.index + (packet.items?.length ?? 0));
  } else if (packet.cmd === 'LocationInfo') {
    for (const item of packet.locations ?? []) facts.scoutOwners.set(item.location, item.player);
  }
};

const observeClient = (facts: NetworkFacts, packet: ApClientPacket): void => {
  facts.packetsOut += 1;
  if (packet.cmd === 'Connect') {
    facts.uuid = packet.uuid;
    facts.deathLink = packet.tags.includes(DEATH_LINK_TAG);
  } else if (packet.cmd === 'ConnectUpdate') {
    facts.deathLink = packet.tags.includes(DEATH_LINK_TAG);
  } else if (packet.cmd === 'GetDataPackage') {
    for (const game of packet.games) facts.requestedGames.add(game);
  } else if (packet.cmd === 'LocationChecks') {
    for (const id of packet.locations) facts.sentChecks.add(id);
  } else if (packet.cmd === 'StatusUpdate' && packet.status === CLIENT_GOAL) {
    facts.goalReported = true;
  }
};

/** The socket closed: what described the live connection goes with it. */
const observeClose = (facts: NetworkFacts): void => {
  facts.connectedAt = null;
};

export { createNetworkFacts, observeClient, observeClose, observeServer };
export type { NetworkFacts };
