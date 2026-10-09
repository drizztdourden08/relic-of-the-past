/* @layer bridge-wasm @kind types */
import type { PondThrowArm } from '../pond-plan';

interface PondSessionPlan {
  throws: readonly PondThrowArm[];
  armed: boolean;
  prizeCount: number;
  awardMoreMessageId: number;
  awardLastMessageId: number;
  closedMessageId: number;
}

export type { PondSessionPlan };
