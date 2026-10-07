/* @layer renderer-widgets @kind logic */
/**
 * The capacity rungs a player can actually stand on with the upgrades this seed hands out, as
 * ladder indices (the numbering the core's rungs use).
 *
 * - Custom, progressive: the plan's own climb, since every copy takes the next planned jump.
 * - Custom, fixed jumps: the start plus any set of the plan's jumps, since the items can be
 *   found in any order and any of them skipped.
 * - In pool: the vanilla rung plus any set of the reference jumps, the same way.
 * - Vanilla: the pond sells every native tier of bombs and arrows; the meter only has the bat's
 *   half level; the wallet has nothing to buy and holds its own ceiling.
 *
 * Nothing below the start is ever offered. Logic reads a family as its start plus what was
 * collected, so a lower value would leave a price or the ending's arrows unpayable while logic
 * still counts them as open. Without a seed the result is null and the core's ladder stands.
 */
import { familyById, planOf } from '@shared/randomizer/ap-world/capacity';
import type { CapacityFamily, CapacityFamilyId, FamilySetting } from '@shared/randomizer/ap-world/capacity';
import type { ActiveCapacity } from '@app/lib/game/randomizer-client/active-capacity-profile';
import type { CapacityKind } from '@app/lib/game';

const FAMILY_OF_KIND: Record<CapacityKind, CapacityFamilyId> = {
  bombs: 'explosives', arrows: 'projectiles', magic: 'meter', wallet: 'wallet',
};

/** The vanilla meter's only upgrade is the half-cost level. */
const VANILLA_METER_RUNGS = [1, 2];

/** Every rung reachable from `base` by adding any subset of `jumps`, capped at the ladder top. */
const subsetRungs = (base: number, jumps: readonly number[], top: number): Set<number> => {
  let reach = new Set<number>([base]);
  for (const jump of jumps) {
    const next = new Set(reach);
    for (const rung of reach) next.add(Math.min(top, rung + jump));
    reach = next;
  }
  return reach;
};

/** The plan's own climb: start, then each cumulative jump. */
const climbRungs = (family: CapacityFamily, setting: FamilySetting): Set<number> =>
  new Set(planOf(family, setting).ladder.map((value) => family.ladder.indexOf(value)).filter((rung) => rung >= 0));

const vanillaRungs = (family: CapacityFamily): Set<number> => {
  if (family.id === 'wallet') return new Set([family.vanillaRung]);
  if (family.id === 'meter') return new Set(VANILLA_METER_RUNGS);
  const top = family.ladder.length - 1;
  return new Set(Array.from({ length: top - family.vanillaRung + 1 }, (_, i) => family.vanillaRung + i));
};

const reachableRungsOf = (kind: CapacityKind, active: ActiveCapacity | null): ReadonlySet<number> | null => {
  if (!active) return null;
  const family = familyById(FAMILY_OF_KIND[kind]);
  const setting = active.profile[family.id];
  const top = family.ladder.length - 1;
  if (setting.mode === 'vanilla') return vanillaRungs(family);
  if (setting.mode === 'vanilla-in-pool') return subsetRungs(family.vanillaRung, family.referenceJumps, top);
  if (active.progressive) return climbRungs(family, setting);
  const { jumps } = planOf(family, setting);
  return subsetRungs(family.indexOf(setting.start), jumps, family.indexOf(setting.max));
};

export { reachableRungsOf, FAMILY_OF_KIND };
