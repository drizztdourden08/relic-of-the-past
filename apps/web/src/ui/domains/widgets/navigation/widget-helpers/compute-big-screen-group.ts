/* @layer renderer-widgets @kind logic */
import { wasmGetAreaHeads } from '../../../../../lib/game';
import { OVERWORLD_SCREENS_PER_WORLD } from '../navigation.constants';

const computeBigScreenGroup = (screenIndex: number): number[] => {
  const heads = wasmGetAreaHeads();
  if (!heads) return [screenIndex];
  const myHead = heads[screenIndex];
  if (myHead === undefined) return [screenIndex];
  const group: number[] = [];
  for (let i = 0; i < OVERWORLD_SCREENS_PER_WORLD; i++) {
    if (heads[i] === myHead) group.push(i);
  }
  return group.length > 0 ? group : [screenIndex];
};

export { computeBigScreenGroup };
