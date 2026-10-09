/* @layer bridge-wasm @kind types */
import type { CreateSocket } from './ap-socket.type';
import type { OnlineRoom } from './online-room';
import type { OnlineSessionConfig } from './online-session-config.type';
import type { TrackerProgress } from './tracker-link';

interface TrackerLinksDeps {
  config: OnlineSessionConfig;
  room: OnlineRoom;
  createSocket: CreateSocket;
  url(): string | null;
  uuid(): string;
  onChange(): void;
}

interface TrackerLinks {
  open(): void;
  closeAll(): void;
  progressOf(slot: number): TrackerProgress | null;
  isLinked(slot: number): boolean;
  readonly size: number;
}

export type { TrackerLinks, TrackerLinksDeps };
