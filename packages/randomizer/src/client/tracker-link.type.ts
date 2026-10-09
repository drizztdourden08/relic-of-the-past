/* @layer bridge-wasm @kind types */
import type { CreateSocket } from './ap-socket.type';

interface TrackerLinkConfig {
  url: string;
  slot: number;
  name: string;
  password?: string;
  uuid: string;
  createSocket: CreateSocket;
  onChange(): void;
}

interface TrackerProgress {
  checked: number;
  total: number;
}

interface TrackerLink {
  readonly progress: TrackerProgress | null;
  readonly linked: boolean;
  close(): void;
}

export type { TrackerLink, TrackerLinkConfig, TrackerProgress };
