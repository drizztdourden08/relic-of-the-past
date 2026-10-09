/* @layer bridge-wasm @kind types */
type CheckGrantPlan =
  | { kind: 'vanilla'; itemLabel: string }
  | { kind: 'placed'; itemId: number; itemLabel: string; locationName: string }
  | { kind: 'blocked'; reason: string };

export type { CheckGrantPlan };
