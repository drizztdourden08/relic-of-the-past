/* @layer bridge-wasm @kind types */
interface Reconnector {
  readonly pending: boolean;
  schedule(): void;
  cancel(): void;
  reset(): void;
}

type ScheduledListener = (delayMs: number, attempt: number) => void;

export type { Reconnector, ScheduledListener };
