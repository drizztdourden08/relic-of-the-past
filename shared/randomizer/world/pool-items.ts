/* @layer shared-game @kind logic */
/**
 * WHICH ITEM the baseline pool puts at a check, where it differs from the item the record
 * names, keyed by the check's own id.
 *
 * This is translation and not a fact. The record says exactly what the unmodified game hands
 * over at that spot; the baseline item pool is stated in its own terms, and the two disagree
 * wherever the pool models a family instead of a tier:
 *
 * - progressive gear stands in for the concrete tier (the four Progressive Swords cover the
 *   uncle's, the smithy's, the pedestal's and the cursed water's; Progressive Shield covers
 *   the wishing water's; Progressive Bow covers her arrow upgrade; Progressive Ocarina covers
 *   the flute spot's);
 * - a boss's heart container is the pool's own boss-drop item, never the pickup the game hands
 *   over;
 * - the three in-dungeon standing keys name their per-dungeon key, which is removed from that
 *   dungeon's restricted set and not from the global pool;
 * - the wishing water holds a red boomerang in the unmodified game, and so does the village
 *   hut's chest, but the pool holds one of each colour, so her slot takes the pool's blue one.
 *
 * Everything else reads its own record: a bottle gift is a plain bottle in both vocabularies,
 * and so is every heart piece, rupee pile and key drop.
 */
import { ITEM } from './item-ids.data';
import type { CheckId, ItemId } from '@shared/game/data/types/ids';
import type { CheckRecord } from '@shared/game/data';

const POOL_ITEM_OVERRIDES: Readonly<Partial<Record<CheckId, ItemId>>> = {
  // Progressive swords, in place of the four tiers the game hands over.
  'check-017': ITEM.progressiveSword,   // the uncle's, at the start
  'check-039': ITEM.progressiveSword,   // the smithy's, once the pair is reunited
  'check-072': ITEM.progressiveSword,   // the pedestal's
  'check-266': ITEM.progressiveSword,   // the cursed water's
  'check-267': ITEM.progressiveBow,     // her second grant
  'check-021': ITEM.blueBoomerang,      // the wishing water's, since the pool holds one of each colour
  'check-022': ITEM.progressiveShield,  // her second grant
  'check-008': ITEM.progressiveOcarina, // the flute spot's
  // The ten boss heart containers.
  'check-121': ITEM.bossHeartContainer,
  'check-130': ITEM.bossHeartContainer,
  'check-140': ITEM.bossHeartContainer,
  'check-155': ITEM.bossHeartContainer,
  'check-166': ITEM.bossHeartContainer,
  'check-180': ITEM.bossHeartContainer,
  'check-191': ITEM.bossHeartContainer,
  'check-202': ITEM.bossHeartContainer,
  'check-215': ITEM.bossHeartContainer,
  'check-231': ITEM.bossHeartContainer,
  // The three standing keys, each named for the dungeon whose set it comes out of.
  'check-126': ITEM.smallKeyDesertPalace,
  'check-135': ITEM.smallKeyTowerOfHera,
  'check-235': ITEM.smallKeyGanonsTower,
};

/** What the baseline pool puts at this check in the unmodified game. */
const poolItemOfCheck = (check: CheckRecord): ItemId | undefined =>
  POOL_ITEM_OVERRIDES[check.id] ?? check.vanillaItemIds[0];

export { POOL_ITEM_OVERRIDES, poolItemOfCheck };
