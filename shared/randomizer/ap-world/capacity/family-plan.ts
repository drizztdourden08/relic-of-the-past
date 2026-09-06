/* @layer shared-game @kind logic */
/**
 * The plan of a family, in every mode: setting → jumps → ladder → items.
 * Vanilla contributes nothing (the preview shows the native ladder from the
 * vanilla rung, sold at the pond); Vanilla in pool ships the reference jumps
 * from that rung; Custom cuts the span between start and max with its curve
 * (start may be rung 0, the empty tier) under the family's item cap (no
 * jump above maxJump). items.length is the In Pool number:
 * N for Custom, 7 / 7 / 1 for Vanilla in pool, 0 for Vanilla. A Custom plan
 * under the progressive option ships N copies of the family's one
 * progressive name instead of N fixed-jump names: the jumps are the same,
 * taken in plan order at grant time instead of carried by the item.
 */
import { jumpsOf } from './curves/jumps-of';
import { ladderOf } from './curves/ladder-of';
import { FAMILIES, familyById } from './capacity-family';
import type { CapacityFamily } from './capacity-family';
import type {
  CapacityFamilyId, CapacityPoolCounts, CapacityProfile, FamilyPlan, FamilySetting,
} from './capacity-profile.type';

/** `progressive` applies to Custom only: Vanilla in pool always ships the reference's own items. */
const planOf = (capacityFamily: CapacityFamily, setting: FamilySetting, progressive = false): FamilyPlan => {
  const { ladder, vanillaRung, referenceJumps, hasSpot, itemFor, progressiveItem, indexOf, maxJump } = capacityFamily;
  if (setting.mode === 'vanilla') {
    return { jumps: [], ladder: ladder.slice(vanillaRung), items: [], spotIsCheck: false, progressive: false };
  }
  if (setting.mode === 'vanilla-in-pool') {
    const jumps = referenceJumps;
    return {
      jumps, ladder: ladderOf(ladder, vanillaRung, jumps), items: jumps.map(itemFor), spotIsCheck: hasSpot, progressive: false,
    };
  }
  const { start, max, count, shape } = setting;
  const low = indexOf(start);
  const span = indexOf(max) - low;
  const jumps = span > 0 ? jumpsOf(shape, count, span, maxJump) : [];
  const items = progressive ? jumps.map(() => progressiveItem) : jumps.map(itemFor);
  return { jumps, ladder: ladderOf(ladder, low, jumps), items, spotIsCheck: hasSpot, progressive };
};

const capacityPlansOf = (profile: CapacityProfile, progressive = false): Record<CapacityFamilyId, FamilyPlan> => ({
  explosives: planOf(familyById('explosives'), profile.explosives, progressive),
  projectiles: planOf(familyById('projectiles'), profile.projectiles, progressive),
  meter: planOf(familyById('meter'), profile.meter, progressive),
  wallet: planOf(familyById('wallet'), profile.wallet, progressive),
});

/** Ladder rung a new file starts at: the Custom start (rung 0 allowed), else the vanilla rung. */
const startTierOf = (capacityFamily: CapacityFamily, setting: FamilySetting | undefined): number =>
  setting?.mode === 'custom' ? capacityFamily.indexOf(setting.start) : capacityFamily.vanillaRung;

/** Ladder rung the family may reach: the Custom max, else the top of the ladder. */
const maxTierOf = (capacityFamily: CapacityFamily, setting: FamilySetting | undefined): number =>
  setting?.mode === 'custom' ? capacityFamily.indexOf(setting.max) : capacityFamily.ladder.length - 1;

/**
 * Pool arithmetic of a profile. `checkSpots` is the number of family spots
 * that are checks in this fill (0 ... 3: the two fairy slots and the bat).
 */
const capacityPoolCountsOf = (profile: CapacityProfile, checkSpots: number): CapacityPoolCounts => {
  const plans = capacityPlansOf(profile);
  const perFamily = Object.fromEntries(
    FAMILIES.map((capacityFamily) => [capacityFamily.id, plans[capacityFamily.id].items.length]),
  ) as Record<CapacityFamilyId, number>;
  const total = FAMILIES.reduce((sum, capacityFamily) => sum + perFamily[capacityFamily.id], 0);
  return { perFamily, poolDelta: total - checkSpots };
};

export { capacityPlansOf, capacityPoolCountsOf, maxTierOf, planOf, startTierOf };
