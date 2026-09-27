/* @layer bridge-wasm @kind logic */
/**
 * The online client's network monitor (network-monitor.ts) together with the tracker links it
 * opens once the roster settles (tracker-links.ts). The links dial the URL the main
 * connection opened on, with this install's client id. Its snapshots also tell the
 * connection's changes as online notices (connection-notices.ts).
 */
import { clientUuid } from './client-uuid';
import { createConnectionNotices } from './connection-notices';
import { createNetworkMonitor } from './network-monitor';
import { createTrackerLinks } from './tracker-links';
import type { CreateSocket } from './ap-socket.type';
import type { NetworkMonitor } from './network-monitor';
import type { TrackerLinksDeps } from './tracker-links';

type MonitorDeps = Omit<Parameters<typeof createNetworkMonitor>[0], 'trackers'>;

interface OnlineNetworkDeps extends MonitorDeps {
  createSocket: CreateSocket;
  /** The URL the main connection opened on; null before it did. */
  url: TrackerLinksDeps['url'];
}

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
export type { OnlineNetworkDeps };
