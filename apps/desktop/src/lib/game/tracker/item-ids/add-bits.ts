/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@rotp/game-data';

const addBits = (out: Set<ItemId>, bits: readonly (readonly [number, ItemId])[], byte: number): void => {
  for (const [bit, id] of bits) if (byte & bit) out.add(id);
};

export { addBits };
