/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@rotp/game-data';
import { addNative } from './add-native';

const addLadder = (out: Set<ItemId>, ladder: readonly number[], held: number): void => {
  for (const [rung, native] of ladder.entries()) {
    if (rung >= held) break;
    addNative(out, native);
  }
};

export { addLadder };
