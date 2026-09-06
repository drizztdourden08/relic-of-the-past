/* @layer shared-game @kind data */
/**
 * The spot of each counted family: the two fairy slots
 * (special-locations.data.ts) for explosives and projectiles, and the
 * meter's giver, which is a row of the NPC scope (scope-vanilla.data.ts) —
 * a vanilla meter locks it explicitly, the other modes leave it to that
 * scope switch. The wallet has no spot.
 */
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

const CAPACITY_SPOTS: ReadonlyMap<CapacityFamilyId, string> = new Map([
  ['explosives', 'Capacity Upgrade Left'],
  ['projectiles', 'Capacity Upgrade Right'],
  ['meter', 'Magic Bat'],
]);

export { CAPACITY_SPOTS };
