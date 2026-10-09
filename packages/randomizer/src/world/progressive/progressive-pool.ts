/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES, REPLACEMENT_ITEM } from './progressive-families.data';
import { referenceCopiesOf } from './reference-copies-of';
import { tickedCountOf } from './progressive-reach';
import type { ProgressiveSetting } from './progressive.type';

const applyProgressiveTicks = (pool: string[], setting: ProgressiveSetting): void => {
  for (const family of PROGRESSIVE_FAMILIES) {
    let remove = referenceCopiesOf(family) - tickedCountOf(setting, family.id);
    while (remove > 0) {
      const index = pool.lastIndexOf(family.poolItem);
      if (index === -1) break;
      pool[index] = REPLACEMENT_ITEM;
      remove -= 1;
    }
    while (remove < 0) {
      const index = pool.lastIndexOf(REPLACEMENT_ITEM);
      if (index === -1) break;
      pool[index] = family.poolItem;
      remove += 1;
    }
  }
};

export { applyProgressiveTicks };
