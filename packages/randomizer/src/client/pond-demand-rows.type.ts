/* @layer bridge-wasm @kind types */
import type { PondDemandArm } from '../pond-demands/pond-demands.type';

interface PondDemandRow extends PondDemandArm {
  location: string;
}

interface PondDemandSessionPlan {
  rows: readonly PondDemandRow[];
  refusals: readonly string[];
}

export type { PondDemandRow, PondDemandSessionPlan };
