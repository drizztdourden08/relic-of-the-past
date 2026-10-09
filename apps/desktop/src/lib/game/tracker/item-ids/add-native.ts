/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@shared/game/data';
import { idOf } from './id-of';

const addNative = (out: Set<ItemId>, receiveItemId: number): void => {
  const id = idOf(receiveItemId);
  if (id) out.add(id);
};

export { addNative };
