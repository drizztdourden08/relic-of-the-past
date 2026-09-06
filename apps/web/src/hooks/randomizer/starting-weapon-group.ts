/* @layer renderer-lib @kind logic */
/**
 * The standard-mode starting-weapon group of the listing. The generator
 * draws the mentor check's weapon at random from the assembled pool
 * (ItemPool.py 294-318: the first sword tier found, the first bow, each
 * arsenal item, the bomb pack), so the group names the whole candidate set
 * — exactly one of these leaves the pool for that check — instead of a
 * single stand-in pick, which would advertise a weapon the seed may never
 * grant. Rows follow the reference's own list order (swords, bows, arsenal,
 * bombs), not the pool scan order.
 */
import { getItemSprite } from '@shared/game/logic/queries/item-sprites';
import {
  UNCLE_ARSENAL_CANDIDATES, UNCLE_BOMB_CANDIDATE, UNCLE_BOW_CANDIDATES, UNCLE_SWORD_CANDIDATES,
} from '@shared/randomizer/ap-world/pool/standard-escape.data';
import { uncleWeaponCandidates } from '@shared/randomizer/ap-world/pool/uncle-weapon';
import { itemIdByStandardName } from '../../lib/game/randomizer-client';
import type { PoolListingGroup, PoolListingRow } from '@domains/app/compounds/PoolListing';

const STARTING_WEAPON_GROUP_ID = 'starting-weapon';

/** The listing model's own partition of the global pool; the weapon group sits right after it. */
const POOL_PARTITION_IDS: ReadonlySet<string> = new Set(['progression', 'useful', 'filler']);

const REFERENCE_ORDER: readonly string[] = [
  ...UNCLE_SWORD_CANDIDATES, ...UNCLE_BOW_CANDIDATES, ...UNCLE_ARSENAL_CANDIDATES, UNCLE_BOMB_CANDIDATE,
];

const spriteOf = (name: string): string | undefined => {
  const id = itemIdByStandardName(name);
  return id === undefined ? undefined : getItemSprite(id);
};

const rowOf = (name: string, spritesAvailable: boolean): PoolListingRow =>
  ({ name, count: 1, sprite: spritesAvailable ? spriteOf(name) : undefined });

/** One row per candidate; the group sets aside exactly one item of the pool. */
const startingWeaponGroupOf = (pool: readonly string[], spritesAvailable: boolean): PoolListingGroup => {
  const rows = uncleWeaponCandidates(pool)
    .sort((a, b) => REFERENCE_ORDER.indexOf(a) - REFERENCE_ORDER.indexOf(b))
    .map((name) => rowOf(name, spritesAvailable));
  return { id: STARTING_WEAPON_GROUP_ID, label: 'Starting weapon (one of)', total: 1, rows };
};

/** Inserts the group after the pool partition, where the model lists the assured weapon. */
const withStartingWeaponGroup = (
  groups: readonly PoolListingGroup[], group: PoolListingGroup,
): PoolListingGroup[] => {
  const index = groups.findIndex((entry) => !POOL_PARTITION_IDS.has(entry.id));
  const at = index === -1 ? groups.length : index;
  return [...groups.slice(0, at), group, ...groups.slice(at)];
};

export { startingWeaponGroupOf, withStartingWeaponGroup };
