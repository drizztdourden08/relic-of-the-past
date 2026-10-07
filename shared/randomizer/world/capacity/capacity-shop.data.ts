/* @layer shared-game @kind data */
/**
 * The capacity fairy's shop: where a VANILLA bomb or arrow family climbs to its top rung, and
 * what she charges for the first step. A family in the pool counts its items instead and never
 * reads this (state-helpers-capacity.ts).
 *
 * It is no event and no location. The game writes no flag for it and the player does nothing
 * that could be recorded: the shop is there to use once the room is reached and the
 * rupees are in the wallet, so the rules read those two facts directly, the way the potion
 * seller is read for the magic extension (state-helpers.ts). The price is the one the
 * reference's shop table lists for a fairy slot.
 */
import { REGION } from '../region-ids.data';
import type { RegionId } from '@shared/game/data/types/ids';

interface CapacityShop {
  region: RegionId;
  price: number;
}

const CAPACITY_SHOP: CapacityShop = { region: REGION.capacityFairy, price: 100 };

export { CAPACITY_SHOP };
export type { CapacityShop };
