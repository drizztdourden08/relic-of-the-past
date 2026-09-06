/* @layer renderer-lib @kind logic */
/**
 * The pool builder's own partition as list groups: the global pool by its
 * classification (progression, useful, filler), the assured starting
 * weapon, the per-dungeon restricted sets, the prizes and the event items —
 * each a name → count multiset, largest count first. The categories are
 * read off the built pool, never re-derived here. Art comes from the
 * extracted sprite set: a capacity-upgrade name resolves to its family's
 * stamped upgrade sprite, any other name goes through its item record, and a
 * name still without art gets no sprite. While the set is not extracted yet,
 * no row carries a sprite at all — the listing shows placeholders instead of
 * asking for files that are not on disk.
 */
import { capacityFamilyOfItemName } from '@shared/game/data';
import { getCapacityUpgradeSprite, getItemSprite } from '@shared/game/logic/queries/item-sprites';
import { itemIdByStandardName } from '../../lib/game/randomizer-client';
import type { ApItemPool } from '@shared/randomizer/ap-world/pool/item-pool.type';
import type { PoolListingGroup, PoolListingRow } from '@domains/app/compounds/PoolListing';

const spriteOf = (name: string): string | undefined => {
  const family = capacityFamilyOfItemName(name);
  if (family !== undefined) return getCapacityUpgradeSprite(family);
  const direct = itemIdByStandardName(name);
  return direct === undefined ? undefined : getItemSprite(direct);
};

const rowsOf = (names: readonly string[], spritesAvailable: boolean): PoolListingRow[] => {
  const counts = new Map<string, number>();
  for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1);
  return [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count, sprite: spritesAvailable ? spriteOf(name) : undefined }));
};

const groupOf = (id: string, label: string, names: readonly string[], spritesAvailable: boolean): PoolListingGroup =>
  ({ id, label, total: names.length, rows: rowsOf(names, spritesAvailable) });

const poolListingGroupsOf = (pool: ApItemPool, spritesAvailable: boolean): PoolListingGroup[] => {
  const group = (id: string, label: string, names: readonly string[]) => groupOf(id, label, names, spritesAvailable);
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
