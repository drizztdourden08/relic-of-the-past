/* @layer shared-game @kind logic */
import { PROGRESSION_TIERS } from '../progression-tiers.constants';
import { FAMILY_OF_POOL_ITEM } from './progressive-reach.constants';
import { tickedIndexesOf } from './ticked-indexes-of';
import type { ItemId } from '@rotp/game-data';
import type { ProgressiveSetting } from '../progressive.type';

const progressiveTierMapOf = (setting: ProgressiveSetting): ReadonlyMap<string, readonly ItemId[]> =>
  new Map([...PROGRESSION_TIERS].map(([item, tiers]): [string, readonly ItemId[]] => {
    const family = FAMILY_OF_POOL_ITEM.get(item);
    if (family === undefined) return [item, tiers];
    return [item, tickedIndexesOf(setting, family).map((index) => tiers[index]).filter((tier) => tier !== undefined)];
  }));

export { progressiveTierMapOf };
