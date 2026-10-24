/* @layer bridge-wasm @kind logic */
import { BEACON_EXPIRY_MS } from '@archipelia/lobby-protocol';
import type { LanEntry } from './create-lan-server-list.type';
import type { LanServer, LanServerList, LanSighting } from './lan.type';
import { parseSighting } from './parse-sighting';

const createLanServerList = (now: () => number = Date.now): LanServerList => {
  const entries = new Map<string, LanEntry>();

  const beaconAlive = (entry: LanEntry): boolean => entry.beaconAt !== null && now() - entry.beaconAt <= BEACON_EXPIRY_MS;

  const servers = (): LanServer[] =>
    [...entries.values()]
      .map((entry): LanServer => ({
        ...entry.server,
        via: [...(entry.mdnsSeen ? ['mdns' as const] : []), ...(beaconAlive(entry) ? ['beacon' as const] : [])],
      }))
      .sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));

  const snapshot = (): string => JSON.stringify(servers());

  const drop = (): void => {
    for (const [id, entry] of entries) {
      if (!entry.mdnsSeen && !beaconAlive(entry)) entries.delete(id);
    }
  };

  const forgetMdns = (key: string): void => {
    for (const entry of entries.values()) {
      if (entry.mdnsKey === key) entry.mdnsSeen = false;
    }
  };

  const remember = (sighting: LanSighting): void => {
    const parsed = parseSighting(sighting);
    if (!parsed.ok) return;
    const { server, source } = parsed;
    const entry = entries.get(server.id) ?? { server, mdnsKey: null, mdnsSeen: false, beaconAt: null };
    entry.server = server;
    if (sighting.kind === 'mdns-up') {
      entry.mdnsKey = sighting.key;
      entry.mdnsSeen = true;
    }
    if (source === 'beacon') entry.beaconAt = now();
    entries.set(server.id, entry);
  };

  const apply = (sighting: LanSighting): void => {
    if (sighting.kind === 'mdns-down') forgetMdns(sighting.key);
    else remember(sighting);
  };

  return {
    ingest: (sighting) => {
      const before = snapshot();
      apply(sighting);
      drop();
      return snapshot() !== before;
    },
    sweep: () => {
      const before = snapshot();
      drop();
      return snapshot() !== before;
    },
    servers,
  };
};

export { createLanServerList };
