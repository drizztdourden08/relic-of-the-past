/* @layer bridge-wasm @kind logic */
import type { ApServerPacket } from '../ap-protocol.type';
import type { NetworkFacts } from './network-facts.type';
import { observeSettings } from './observe-settings';

const versionText = (version: { major: number; minor: number; build: number } | undefined): string | null =>
  version && typeof version.major === 'number' ? `${version.major}.${version.minor}.${version.build}` : null;

const worldVersionOf = (slotData: unknown): string | null => {
  const value = (slotData as { worldVersion?: unknown } | null)?.worldVersion;
  return typeof value === 'string' ? value : null;
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

export { observeServer };
