/* @layer bridge-wasm @kind types */
import type { NameTables } from './ap-names';
import type { ApClientPacket, ApServerPacket } from './ap-protocol.type';
import type { NetworkFacts } from './network-facts';
import type { NetworkStatus, NetworkStatusListener } from './network-status.type';
import type { OnlineCore } from './online-core.type';
import type { OnlineRoom } from './online-room';
import type { OnlineSessionConfig } from './online-session-config.type';
import type { RandomizerSession } from './session.type';
import type { TrackerLinks } from './tracker-links.type';

interface NetworkMonitorDeps {
  config: OnlineSessionConfig;
  room: OnlineRoom;
  names: NameTables;
  core: Pick<OnlineCore, 'readReceivedIndex' | 'isFileInPlay'>;
  trackers: TrackerLinks;
  send(packet: ApClientPacket): void;
  sessionStatus(): RandomizerSession['status'];
  now?: () => number;
}

interface NetworkMonitor {
  readonly status: NetworkStatus;
  onChange(listener: NetworkStatusListener): () => void;
  received(packet: ApServerPacket): boolean;
  changed(): void;
  send(packet: ApClientPacket): void;
  opened(url: string): void;
  closed(): void;
  retrying(delayMs: number, attempt: number): void;
  attempting(): void;
  failed(message: string): void;
  stop(): void;
  reset(): void;
}

type NetworkLifecycle = Pick<
  NetworkMonitor, 'opened' | 'closed' | 'retrying' | 'attempting' | 'failed' | 'stop' | 'reset'
>;

interface MonitorState {
  facts: NetworkFacts;
}

interface LifecycleControl {
  state: MonitorState;
  changed: () => void;
  forgetConnection: () => void;
  now: () => number;
}

export type { LifecycleControl, MonitorState, NetworkLifecycle, NetworkMonitor, NetworkMonitorDeps };
