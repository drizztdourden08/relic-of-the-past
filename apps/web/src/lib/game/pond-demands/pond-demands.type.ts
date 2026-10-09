/* @layer bridge-wasm @kind types */
interface PondDemandArm {
  pond: number;
  rung: number;
  kind: number;
  amount: number;
  nativeId: number;
  askMessageId: number;
  refuseMessageId: number;
  awardMessageId: number;
}

export type { PondDemandArm };
