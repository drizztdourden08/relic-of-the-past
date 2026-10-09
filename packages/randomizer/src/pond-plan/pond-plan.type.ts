/* @layer bridge-wasm @kind types */
interface PondThrowArm {
  price: number;
  prize: number;
  refund: number;
  prompt: number;
  consolation: number;
}

interface PondPrizeArm {
  prize: number;
  newItem: number;
  messageId: number;
  fireId: number;
}

export type { PondPrizeArm, PondThrowArm };
