/* @layer shared-game @kind constants */
import { ITEM } from '../item-ids.data';
import { PROGRESSIVE_FAMILIES } from './progressive-families.data';
import type { ItemId } from '@rotp/game-data';

const BOW_TIERS: readonly ItemId[] = PROGRESSIVE_FAMILIES
  .filter((family) => family.id === 'bow')
  .flatMap((family) => family.tiers);

const PROGRESSION_TIERS: ReadonlyMap<ItemId, readonly ItemId[]> = new Map([
  ...PROGRESSIVE_FAMILIES
    .filter((family) => family.id !== 'mail')
    .map((family): [ItemId, readonly ItemId[]] => [family.poolItem, family.tiers]),
  [ITEM.progressiveBowAlt, BOW_TIERS] as [ItemId, readonly ItemId[]],
]);

export { BOW_TIERS, PROGRESSION_TIERS };
