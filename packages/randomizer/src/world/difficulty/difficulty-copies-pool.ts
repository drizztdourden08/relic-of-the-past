/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.constants';
import { isRandomOrder } from '../progressive/progressive-modes';
import { DEFAULT_COPY_MULTIPLIER } from './difficulty';
import { countInPool } from './count-in-pool';
import type { ProgressiveModeSetting } from '../progressive/progressive.type';
import type { CopyMultiplierSetting } from './difficulty.type';

const carriedNamesOf = (
  family: (typeof PROGRESSIVE_FAMILIES)[number], modes: ProgressiveModeSetting,
): readonly string[] => (isRandomOrder(modes, family.id) ? family.tiers : [family.poolItem]);

const applyCopyMultipliers = (
  pool: string[], modes: ProgressiveModeSetting, copies: Partial<CopyMultiplierSetting>,
): number => {
  const added: string[] = [];
  PROGRESSIVE_FAMILIES.forEach((family) => {
    const extra = (copies[family.id] ?? DEFAULT_COPY_MULTIPLIER) - DEFAULT_COPY_MULTIPLIER;
    if (extra <= 0) return;
    for (const name of carriedNamesOf(family, modes)) {
      const carried = countInPool(pool, name);
      for (let copy = 0; copy < carried * extra; copy += 1) added.push(name);
    }
  });
  pool.push(...added);
  return added.length;
};

export { applyCopyMultipliers };
