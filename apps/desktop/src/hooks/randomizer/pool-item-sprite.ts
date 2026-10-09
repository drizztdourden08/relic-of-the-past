/* @layer renderer-hooks @kind logic */
import { capacityFamilyOfItemName } from '@rotp/game-data';
import { getCapacityUpgradeSprite, getItemSprite } from '@rotp/game-data';
import { itemIdByStandardName } from '../../lib/game/randomizer-client/item-lookup';

const poolItemSpriteOf = (name: string): string | undefined => {
  const family = capacityFamilyOfItemName(name);
  if (family !== undefined) return getCapacityUpgradeSprite(family);
  const direct = itemIdByStandardName(name);
  return direct === undefined ? undefined : getItemSprite(direct);
};

export { poolItemSpriteOf };
