/* @layer bridge-wasm @kind types */
import type { PlanEntry } from '@rotp/randomizer';

type OverrideContext = {
  tag: string;
  receiptLineOf: (location: string, localId: number) => number;
};

type OverrideApplier = (entry: PlanEntry, context: OverrideContext) => void;

export type { OverrideApplier, OverrideContext };
