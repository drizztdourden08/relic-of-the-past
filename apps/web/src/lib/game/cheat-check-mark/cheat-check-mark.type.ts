/* @layer bridge-wasm @kind types */
type WritablePlan = { write: () => void };

type MarkPlan = WritablePlan | { refusal: string };

export type { MarkPlan, WritablePlan };
