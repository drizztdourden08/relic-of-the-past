/* @layer renderer-lib @kind logic */
import { getItemSprite } from '@rotp/game-data';
import { uncleWeaponCandidates } from '@rotp/randomizer';
import { isUnrecordedItem } from '@rotp/randomizer';
import { itemKeyName } from '@rotp/randomizer';
import type { ItemKey } from '@rotp/randomizer';
import type { PoolListingGroup, PoolListingRow } from '@app/compounds/PoolListing';
import { REFERENCE_ORDER, STARTING_WEAPON_GROUP_ID } from './starting-weapon-group.constants';

const spriteOf = (item: ItemKey): string | undefined =>
  (isUnrecordedItem(item) ? undefined : getItemSprite(item));

const rowOf = (item: ItemKey, spritesAvailable: boolean): PoolListingRow =>
  ({ name: itemKeyName(item), count: 1, sprite: spritesAvailable ? spriteOf(item) : undefined });

const startingWeaponGroupOf = (pool: readonly ItemKey[], spritesAvailable: boolean): PoolListingGroup => {
  const rows = uncleWeaponCandidates(pool)
    .sort((a, b) => REFERENCE_ORDER.indexOf(a) - REFERENCE_ORDER.indexOf(b))
    .map((item) => rowOf(item, spritesAvailable));
  return { id: STARTING_WEAPON_GROUP_ID, label: 'Starting weapon (one of)', total: 1, rows };
};

export { startingWeaponGroupOf };
