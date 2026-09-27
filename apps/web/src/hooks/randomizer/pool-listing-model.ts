/* @layer renderer-lib @kind logic */
/**
 * The pool builder's own partition as list groups: the global pool by its
 * classification (progression, useful, filler), the assured starting
 * weapon, the per-dungeon restricted sets, the prizes and the event items,
 * each a name → count multiset, largest count first. The categories are
 * read off the built pool, never re-derived here. Art comes from the
 * extracted sprite set through the one lookup every surface shares
 * (pool-item-sprite.ts). While the set is not extracted yet,
 * no row carries a sprite at all, so the listing shows placeholders instead of
 * asking for files that are not on disk.
 */
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import { poolItemSpriteOfKey } from './pool-item-sprite';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { ItemPool } from '@shared/randomizer/world/pool/item-pool.type';
import type { PoolListingGroup, PoolListingRow } from '@domains/app/compounds/PoolListing';

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

const poolListingGroupsOf = (pool: ItemPool, spritesAvailable: boolean): PoolListingGroup[] => {
  const group = (id: string, label: string, items: readonly ItemKey[]) => groupOf(id, label, items, spritesAvailable);
  return [
    group('progression', 'Progression', pool.progression),
    group('useful', 'Useful', pool.useful),
    group('filler', 'Filler', pool.filler),
    ...(pool.uncleWeapon === undefined ? [] : [group('starting-weapon', 'Starting weapon', [pool.uncleWeapon])]),
    ...[...pool.dungeonItems].map(([dungeon, items]) => group(`dungeon:${dungeon}`, `${dungeon} items`, items)),
    group('prizes', 'Prizes', pool.prizes),
    group('events', 'Events', [...pool.eventItems.values()]),
  ].filter((entry) => entry.total > 0);
};

export { poolListingGroupsOf };
