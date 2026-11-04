/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { isItemUsable } from '../item-usability';
import { progressiveTierMapOf } from '../progressive/progressive-reach';
import { DEFAULT_PROGRESSIVE_SETTING } from '../progressive/progressive-families.constants';
import type { CollectionHooks } from '@drizztdourden08/brock-randomizer/world';
import type { RotpWorld, WorldOptions } from '../world.type';

const collectionHooksOf = (options: WorldOptions): CollectionHooks<RotpWorld> => {
  const tiersByItem = progressiveTierMapOf(options.progressiveTiers ?? DEFAULT_PROGRESSIVE_SETTING);
  return {
    expandOnCollect: (item, held) => {
      const tiers = tiersByItem.get(item);
      if (tiers === undefined) return null;
      const rank = Math.min(held, tiers.length);
      return rank > 0 ? itemAt(tiers, rank - 1) : null;
    },
    isUsable: isItemUsable,
  };
};

export { collectionHooksOf };
