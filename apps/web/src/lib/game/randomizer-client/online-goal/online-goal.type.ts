/* @layer bridge-wasm @kind types */
interface GoalReporter {
  readonly reached: boolean;
  report(): void;
  onConnected(): void;
}

export type { GoalReporter };
