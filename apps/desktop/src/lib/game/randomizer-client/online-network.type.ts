/* @layer bridge-wasm @kind types */
import type { CreateSocket } from './ap-socket.type';
import type { createNetworkMonitor } from './network-monitor';
import type { TrackerLinksDeps } from './tracker-links';

type MonitorDeps = Omit<Parameters<typeof createNetworkMonitor>[0], 'trackers'>;

interface OnlineNetworkDeps extends MonitorDeps {
  createSocket: CreateSocket;
  url: TrackerLinksDeps['url'];
}

export type { MonitorDeps, OnlineNetworkDeps };
