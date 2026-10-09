/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.data';
import { isRandomOrder } from '../progressive/progressive-modes.data';
import { DEFAULT_COPY_MULTIPLIER } from './difficulty.data';
import { countInPool } from './count-in-pool';
import type { ProgressiveModeSetting } from '../progressive/progressive.type';
import type { CopyMultiplierSetting } from './difficulty.type';

const carriedNamesOf = (
  familyIndex: number, modes: ProgressiveModeSetting,
): readonly string[] => {
  const family = PROGRESSIVE_FAMILIES[familyIndex];
  return isRandomOrder(modes, family.id) ? family.tiers : [family.poolItem];
};

const applyCopyMultipliers = (
  pool: string[], modes: ProgressiveModeSetting, copies: CopyMultiplierSetting,
): number => {
  const added: string[] = [];
  PROGRESSIVE_FAMILIES.forEach((family, index) => {
    const extra = (copies[family.id] ?? DEFAULT_COPY_MULTIPLIER) - DEFAULT_COPY_MULTIPLIER;
    if (extra <= 0) return;
    for (const name of carriedNamesOf(index, modes)) {
      const carried = countInPool(pool, name);
      for (let copy = 0; copy < carried * extra; copy += 1) added.push(name);
    }
  });
  pool.push(...added);
  return added.length;
};

export { applyCopyMultipliers };
