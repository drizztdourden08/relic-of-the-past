/* @layer bridge-wasm @kind logic */
import type {
  ApConnectedPacket, ApDataPackagePacket, ApGameData, ApLocationInfoPacket, ApReceivedItemsPacket, ApRoomInfoPacket,
  ApServerPacket,
} from '../ap-protocol.type';
import type { NetworkFacts } from './network-facts.type';
import { observeSettings } from './observe-settings';

const versionText = (version: { major: number; minor: number; build: number } | undefined): string | null =>
  version && typeof version.major === 'number' ? `${version.major}.${version.minor}.${version.build}` : null;

const worldVersionOf = (slotData: unknown): string | null => {
  const value = (slotData as { worldVersion?: unknown } | null)?.worldVersion;
  return typeof value === 'string' ? value : null;
};

const checksumOf = (game: ApGameData | undefined): string | undefined => game?.checksum;

const observeRoomInfo = (facts: NetworkFacts, packet: ApRoomInfoPacket): void => {
  facts.seedName = packet.seed_name ?? null;
  facts.serverVersion = versionText(packet.version);
  facts.generatorVersion = versionText(packet.generator_version);
  facts.games = Array.isArray(packet.games) ? [...packet.games] : [];
  facts.roomChecksums = packet.datapackage_checksums ?? {};
  facts.passwordRequired = typeof packet.password === 'boolean' ? packet.password : null;
  facts.requestedGames = new Set();
  observeSettings(facts, packet);
};

const observeDataPackage = (facts: NetworkFacts, packet: ApDataPackagePacket): void => {
  for (const [game, data] of Object.entries(packet.data?.games ?? {})) facts.fetchedChecksums.set(game, checksumOf(data));
};

const observeConnected = (facts: NetworkFacts, packet: ApConnectedPacket, now: number): void => {
  facts.connectedAt = now;
  facts.reconnectAttempt = 0;
  facts.nextRetryAt = null;
  facts.retryInFlight = false;
  facts.worldVersion = worldVersionOf(packet.slot_data);
  observeSettings(facts, packet);
};

const observeReceivedItems = (facts: NetworkFacts, packet: ApReceivedItemsPacket): void => {
  facts.itemsReceived = Math.max(facts.itemsReceived, packet.index + (packet.items?.length ?? 0));
};

const observeLocationInfo = (facts: NetworkFacts, packet: ApLocationInfoPacket): void => {
  for (const item of packet.locations ?? []) facts.scoutOwners.set(item.location, item.player);
};

const observeServer = (facts: NetworkFacts, packet: ApServerPacket, now: number): void => {
  facts.lastPacketAt = now;
  facts.packetsIn += 1;
  if (packet.cmd === 'RoomInfo') {
    observeRoomInfo(facts, packet);
  } else if (packet.cmd === 'DataPackage') {
    observeDataPackage(facts, packet);
  } else if (packet.cmd === 'Connected') {
    observeConnected(facts, packet, now);
  } else if (packet.cmd === 'RoomUpdate') {
    observeSettings(facts, packet);
  } else if (packet.cmd === 'ReceivedItems') {
    observeReceivedItems(facts, packet);
  } else if (packet.cmd === 'LocationInfo') {
    observeLocationInfo(facts, packet);
  }
};

export { observeServer };
