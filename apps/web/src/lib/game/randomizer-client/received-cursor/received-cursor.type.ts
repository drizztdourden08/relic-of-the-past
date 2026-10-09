/* @layer bridge-wasm @kind types */
interface ReceivedCursor {
  queued: number;
  readonly handed: Set<number>;
  readonly settled: Set<number>;
  epoch: number;
}

export type { ReceivedCursor };
