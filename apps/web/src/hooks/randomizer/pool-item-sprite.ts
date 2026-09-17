/* @layer renderer-hooks @kind logic */
/**
 * The extracted PNG of one pool item, by the name the pool carries. A
 * capacity-upgrade name resolves to its family's stamped upgrade sprite, any
 * other name goes through its item record, and a name with no art at all
 * resolves to nothing. One lookup, shared by the pool listing and by a price
 * that names an item, so there is no second path to a sprite.
 */
import { capacityFamilyOfItemName } from '@shared/game/data';
import { getCapacityUpgradeSprite, getItemSprite } from '@shared/game/logic/queries/item-sprites';
// The lookup itself, not the client barrel: a sprite needs no session.
import { itemIdByStandardName } from '../../lib/game/randomizer-client/item-lookup';

const poolItemSpriteOf = (name: string): string | undefined => {
  const family = capacityFamilyOfItemName(name);
  if (family !== undefined) return getCapacityUpgradeSprite(family);
  const direct = itemIdByStandardName(name);
  return direct === undefined ? undefined : getItemSprite(direct);
};

export { poolItemSpriteOf };
