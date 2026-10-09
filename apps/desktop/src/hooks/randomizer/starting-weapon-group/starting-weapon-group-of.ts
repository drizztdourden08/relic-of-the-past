/* @layer renderer-lib @kind logic */
import { getItemSprite } from '@rotp/game-data';
import { uncleWeaponCandidates } from '@shared/randomizer/world/pool/uncle-weapon';
import { isUnrecordedItem } from '@shared/randomizer/world/item-ids.data';
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { PoolListingGroup, PoolListingRow } from '@domains/app/compounds/PoolListing';
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
