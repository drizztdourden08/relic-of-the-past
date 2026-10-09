/* @layer bridge-wasm @kind types */
interface WishPondRungArm {
  pond: number;
  rung: number;
  newItem: number;
  messageId: number;
  fireId: number;
  assigned: boolean;
}

interface WishPondLinesArm {
  pond: number;
  awardMessageId: number;
  closedMessageId: number;
}

export type { WishPondLinesArm, WishPondRungArm };
