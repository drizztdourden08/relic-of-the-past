/* @layer bridge-wasm @kind logic */
import { clientUuid } from '@rotp/randomizer';
import { createConnectionNotices } from '@rotp/randomizer';
import { createNetworkMonitor } from '@rotp/randomizer';
import { createTrackerLinks } from './tracker-links';
import type { NetworkMonitor } from '@rotp/randomizer';
import type { OnlineNetworkDeps } from '@rotp/randomizer';

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
export type { OnlineNetworkDeps } from '@rotp/randomizer';
