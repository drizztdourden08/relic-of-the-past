/* @layer shared-game @kind data */
/**
 * The order a region hands its locations to the fill, where record order is not it.
 *
 * A FILL ORDER, not a fact about the game. The fill shuffles one candidate list and that list
 * is built region by region, so the order a region lists its rows in decides which item lands
 * where. The reference builds a dungeon's rows in walk order, with a key drop sitting where
 * the pot it comes from stands; the records number the same rows by kind, key drops last. The
 * two agree everywhere except the nine regions below, and dropping this table moves 9 to 14
 * rows of every seed in tests/regression (measured, step 8c).
 *
 * Nothing else reads it. Every other region comes out in record order, which is already the
 * reference's, and build-world throws when a row here is not exactly that region's own set.
 */
import type { CheckId, RegionId } from '@shared/game/data/types/ids';

const REGION_LOCATION_ORDER: Readonly<Partial<Record<RegionId, readonly CheckId[]>>> = {
  // Dam: the floodgate itself is worked before the chest behind it.
  'region-063': ['check-025', 'check-024'],
  // Desert Palace North: the three pots come before the boss and its prize.
  'region-167': ['check-132', 'check-133', 'check-134', 'check-130', 'check-131'],
  // Eastern Palace: the two key drops sit between the third and fourth chest.
  'region-168': [
    'check-116', 'check-117', 'check-118', 'check-123', 'check-124',
    'check-119', 'check-120', 'check-121', 'check-122',
  ],
  // Swamp Palace (North): the waterway pot comes before the waterfall room.
  'region-185': ['check-163', 'check-164', 'check-172', 'check-165', 'check-166', 'check-167'],
  // Thieves Town (Deep): both pots come before the cell.
  'region-187': ['check-177', 'check-178', 'check-182', 'check-183', 'check-179'],
  // Skull Woods Final Section: the corner pot comes before the boss and its prize.
  'region-196': ['check-194', 'check-191', 'check-192'],
  // Ice Palace (Entrance): the jelly drop comes before the compass chest.
  'region-197': ['check-204', 'check-195'],
  // Ice Palace (Main): the pot room sits between the first and second chest.
  'region-199': ['check-196', 'check-207', 'check-197', 'check-198'],
  // Agahnim 2: the validation chest comes before the fight.
  'region-239': ['check-261', 'check-349'],
};

export { REGION_LOCATION_ORDER };
