/* @layer shared-game @kind data */
/**
 * The pond's prize slots, in the order the pond hands them over.
 *
 * The reference names the pond's two checks "Capacity Upgrade Left" and
 * "Capacity Upgrade Right" (its model of the pond as a two-slot shop), so
 * prize 1 and prize 2 keep exactly those names: a placement made under the
 * legacy mode stays readable, and every rule, price and check record that
 * already names them keeps working. The reference has no name for a third
 * prize because it has no such check, so prizes 3 and up carry our own name
 * on the same prefix.
 *
 * Why one queue and not one per side: the pond charges BEFORE the player
 * picks bombs or arrows (the price prompt is its own dialogue, the side
 * choice comes after the fairy rises), so a per-side price ladder cannot
 * exist. The side choice still decides which family climbs when a throw wins
 * no prize.
 */
import { POND_MAX_ITEMS } from './pond-ladder.data';

/** Prize 1 and 2 as the reference names them; 3 ... 20 on the same prefix. */
const POND_PRIZE_LOCATIONS: readonly string[] = [
  'Capacity Upgrade Left',
  'Capacity Upgrade Right',
  ...Array.from({ length: POND_MAX_ITEMS - 2 }, (_, index) => `Capacity Upgrade Pond ${index + 3}`),
];

/** The prize slots the reference does NOT name: ours, and never present in the legacy mode. */
const POND_EXTRA_LOCATIONS: readonly string[] = POND_PRIZE_LOCATIONS.slice(2);

const POND_LOCATION_SET: ReadonlySet<string> = new Set(POND_PRIZE_LOCATIONS);

export { POND_EXTRA_LOCATIONS, POND_LOCATION_SET, POND_PRIZE_LOCATIONS };
