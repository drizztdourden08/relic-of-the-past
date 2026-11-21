/* @layer renderer-lib @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { itemKeyName } from '@rotp/randomizer';
import { poolItemSpriteOfKey } from './pool-item-sprite-of-key';
import type { ItemKey, ItemPool } from '@rotp/randomizer';
import type { PoolListingGroup, PoolListingRow } from '@app/compounds/PoolListing';

const rowsOf = (items: readonly ItemKey[], spritesAvailable: boolean): PoolListingRow[] => {
  const counts = new Map<ItemKey, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts]
    .map(([item, count]) => ({
      name: itemKeyName(item), count, sprite: spritesAvailable ? poolItemSpriteOfKey(item) : undefined,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

const groupOf = (id: string, label: string, items: readonly ItemKey[], spritesAvailable: boolean): PoolListingGroup =>
  ({ id, label, total: items.length, rows: rowsOf(items, spritesAvailable) });

const poolListingGroupsOf = (pool: ItemPool, spritesAvailable: boolean, t: I18n['t']): PoolListingGroup[] => {
  const group = (id: string, label: string, items: readonly ItemKey[]) => groupOf(id, label, items, spritesAvailable);
  return [
    group('progression', t('randomizer:pool-listing.progression'), pool.progression),
    group('useful', t('randomizer:pool-listing.useful'), pool.useful),
    group('filler', t('randomizer:pool-listing.filler'), pool.filler),
    ...(pool.uncleWeapon === undefined ? [] : [group('starting-weapon', t('randomizer:pool-listing.starting-weapon'), [pool.uncleWeapon])]),
    ...[...pool.dungeonItems].map(([dungeon, items]) => group(`dungeon:${dungeon}`, t('randomizer:pool-listing.dungeon-items', { dungeon }), items)),
    group('prizes', t('randomizer:pool-listing.prizes'), pool.prizes),
  ].filter((entry) => entry.total > 0);
};

export { poolListingGroupsOf };
