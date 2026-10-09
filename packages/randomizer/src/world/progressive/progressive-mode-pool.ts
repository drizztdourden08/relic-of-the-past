/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from './progressive-families.constants';
import { isRandomOrder } from './progressive-modes';
import { tickedIndexesOf } from './progressive-reach';
import type { ProgressiveModeSetting, ProgressiveSetting } from './progressive.type';

const positionsOf = (pool: readonly string[], name: string): number[] => {
  const found: number[] = [];
  pool.forEach((item, index) => { if (item === name) found.push(index); });
  return found;
};

const applyProgressiveModes = (
  pool: string[], setting: ProgressiveSetting, modes: ProgressiveModeSetting,
): void => {
  for (const family of PROGRESSIVE_FAMILIES) {
    if (!isRandomOrder(modes, family.id)) continue;
    const copies = positionsOf(pool, family.poolItem);
    const rungs = [...tickedIndexesOf(setting, family.id)].reverse();
    copies.forEach((position, order) => {
      const rung = rungs[order];
      const name = rung === undefined ? undefined : family.tiers[rung];
      if (name !== undefined) pool[position] = name;
    });
  }
};

export { applyProgressiveModes };
