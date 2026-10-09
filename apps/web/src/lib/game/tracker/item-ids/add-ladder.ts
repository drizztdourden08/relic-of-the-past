/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@shared/game/data';
import { addNative } from './add-native';

const addLadder = (out: Set<ItemId>, ladder: readonly number[], held: number): void => {
  for (let rung = 0; rung < held && rung < ladder.length; rung++) addNative(out, ladder[rung]);
};

export { addLadder };
