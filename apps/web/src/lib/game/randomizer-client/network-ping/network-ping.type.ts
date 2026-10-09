/* @layer bridge-wasm @kind types */
import type { ApBouncedPacket, ApClientPacket } from '../ap-protocol.type';

interface PingDeps {
  send(packet: ApClientPacket): void;
  onSample(): void;
  now?: () => number;
}

interface Pinger {
  readonly lastMs: number | null;
  readonly meanMs: number | null;
  readonly samples: number;
  start(slot: number): void;
  stop(): void;
  handleBounced(packet: ApBouncedPacket): boolean;
}

export type { PingDeps, Pinger };
