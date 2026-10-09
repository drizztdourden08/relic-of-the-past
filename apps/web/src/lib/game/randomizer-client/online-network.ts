/* @layer bridge-wasm @kind logic */
import { clientUuid } from './client-uuid';
import { createConnectionNotices } from './connection-notices';
import { createNetworkMonitor } from './network-monitor';
import { createTrackerLinks } from './tracker-links';
import type { NetworkMonitor } from './network-monitor';
import type { OnlineNetworkDeps } from './online-network.type';

const createOnlineNetwork = (deps: OnlineNetworkDeps): NetworkMonitor => {
  const { createSocket, url, ...monitorDeps } = deps;
  let monitor: NetworkMonitor | null = null;
  const trackers = createTrackerLinks({
    config: deps.config, room: deps.room, createSocket, url, uuid: clientUuid, onChange: () => monitor?.changed(),
  });
  monitor = createNetworkMonitor({ ...monitorDeps, trackers });
  monitor.onChange(createConnectionNotices());
  return monitor;
};

export { createOnlineNetwork };
export type { OnlineNetworkDeps } from './online-network.type';
