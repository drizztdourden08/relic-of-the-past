/* @layer shared-game @kind data */
/**
 * The spot of each counted family: the two fairy slots
 * (special-locations.data.ts) for explosives and projectiles, and the
 * meter's giver, which is a row of the NPC scope (scope-vanilla.data.ts),
 * a vanilla meter locks it explicitly, the other modes leave it to that
 * scope switch. The wallet has no spot.
 *
 * The two fairy slots carry Archipelago's own names, because an online
 * session addresses every location by that string and knows no other. They
 * were once renamed after the family each one grows, which read better and
 * cost the pond its whole presence in a multiworld: the server had no
 * location by either new name. What a player reads comes from the pond
 * display names instead (display-names/pond-display-name.ts), which is where
 * a nicer name belongs. LEGACY_CAPACITY_SPOT_NAMES keeps the family spelling
 * addressable, because a placement frozen while it was in use stored it.
 */
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

const CAPACITY_SPOTS: ReadonlyMap<CapacityFamilyId, string> = new Map([
  ['explosives', 'Capacity Upgrade Left'],
  ['projectiles', 'Capacity Upgrade Right'],
  ['meter', 'Magic Bat'],
]);

/** The two fairy slots, in the order the pond hands them over, as a plain list. */
const CAPACITY_SPOT_LOCATIONS: readonly string[] = ['Capacity Upgrade Left', 'Capacity Upgrade Right'];

/** The family spelling of each fairy slot, mapped to the name it carries now. */
const LEGACY_CAPACITY_SPOT_NAMES: ReadonlyMap<string, string> = new Map([
  ['Bomb Capacity Upgrade', 'Capacity Upgrade Left'],
  ['Arrow Capacity Upgrade', 'Capacity Upgrade Right'],
]);

export { CAPACITY_SPOTS, CAPACITY_SPOT_LOCATIONS, LEGACY_CAPACITY_SPOT_NAMES };
