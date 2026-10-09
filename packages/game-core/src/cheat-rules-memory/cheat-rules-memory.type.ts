/* @layer bridge-wasm @kind types */
type RuleValue = number | boolean;
type RuleApplier = (value: RuleValue) => void;

export type { RuleValue, RuleApplier };
