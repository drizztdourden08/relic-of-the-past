/* @layer bridge-wasm @kind logic */
import { BEACON_INTERVAL_MS } from '@archipelia/lobby-protocol';
import { createLanServerList } from './create-lan-server-list';
import { lanDiscoverySettings } from './lan-discovery-settings';
import type { LanServer, LanSightingSource } from './lan.type';
import type { WatchDeps } from './watch-lan-servers.type';

const watchLanServers = (
  source: LanSightingSource,
  onChange: (servers: LanServer[]) => void,
  deps: WatchDeps = {},
): (() => void) => {
  const list = createLanServerList(deps.now);
  const unsubscribe = source.onSighting((sighting) => {
    if (list.ingest(sighting)) onChange(list.servers());
  });
  const timer = setInterval(() => {
    if (list.sweep()) onChange(list.servers());
  }, deps.sweepMs ?? BEACON_INTERVAL_MS);
  void source.start(lanDiscoverySettings());
  return () => {
    clearInterval(timer);
    unsubscribe();
    void source.stop();
  };
};

export { watchLanServers };
