/* @layer shared-game @kind data */
/**
 * The spot of each counted family: the two fairy slots
 * (special-locations.data.ts) for explosives and projectiles, and the
 * meter's giver, which is a row of the NPC scope (scope-vanilla.data.ts),
 * a vanilla meter locks it explicitly, the other modes leave it to that
 * scope switch. The wallet has no spot.
 *
 * The reference calls the two "Capacity Upgrade Left" and "Capacity Upgrade Right",
 * because it models the pond as a shop with two shelves. The game has no shelves: the
 * pond asks a question and the player answers bombs or arrows, so each spot is named for
 * the family it grows. REFERENCE_CAPACITY_SPOT_NAMES keeps the old pair addressable,
 * because they are what a placement generated before this rename stored and what an
 * Archipelago server sends on the wire (datapackage ids 4194334 and 4194335).
 */
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

const CAPACITY_SPOTS: ReadonlyMap<CapacityFamilyId, string> = new Map([
  ['explosives', 'Bomb Capacity Upgrade'],
  ['projectiles', 'Arrow Capacity Upgrade'],
  ['meter', 'Magic Bat'],
]);

/** The two fairy slots, in the reference's own order, as a plain list. */
const CAPACITY_SPOT_LOCATIONS: readonly string[] = ['Bomb Capacity Upgrade', 'Arrow Capacity Upgrade'];

/** The reference's name for each fairy slot, mapped to ours. */
const REFERENCE_CAPACITY_SPOT_NAMES: ReadonlyMap<string, string> = new Map([
  ['Capacity Upgrade Left', 'Bomb Capacity Upgrade'],
  ['Capacity Upgrade Right', 'Arrow Capacity Upgrade'],
]);

export { CAPACITY_SPOTS, CAPACITY_SPOT_LOCATIONS, REFERENCE_CAPACITY_SPOT_NAMES };
