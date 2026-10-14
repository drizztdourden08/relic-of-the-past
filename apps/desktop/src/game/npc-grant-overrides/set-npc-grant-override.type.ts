/* @layer bridge-wasm @kind types */
type SetNpcGrantOverrideParams = {
  roomId: number | null;
  vanillaItem: number;
  newItem: number;
  messageId?: number;
  fireId?: number;
};

type SetNpcGrantSpriteOverrideParams = {
  spriteType: number;
  vanillaItem: number;
  newItem: number;
  messageId?: number;
  fireId?: number;
};

export type { SetNpcGrantOverrideParams, SetNpcGrantSpriteOverrideParams };
