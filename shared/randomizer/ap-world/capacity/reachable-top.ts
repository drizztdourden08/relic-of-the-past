/* @layer shared-game @kind logic */
/**
 * The top rung a family can ever stand on under a profile: the vanilla rung
 * for a family left alone, or the Custom start plus every planned jump,
 * clamped to the ladder's end. Every ceiling that follows the profile reads
 * it from here (a rupee price, a retro shot cost, the pond's dearest throw)
 * so no two of them can disagree about what a wallet holds.
 */
import { planOf, startTierOf } from './family-plan';
import type { CapacityFamily } from './capacity-family';
import type { CapacityProfile } from './capacity-profile.type';

const reachableTopOf = (family: CapacityFamily, profile: CapacityProfile): number => {
  const setting = profile[family.id];
  if (setting.mode !== 'custom') return family.ladder[family.vanillaRung];
  const jumps = planOf(family, setting).jumps;
  const rung = Math.min(
    family.ladder.length - 1,
    startTierOf(family, setting) + jumps.reduce((sum, jump) => sum + jump, 0),
  );
  return family.ladder[rung];
};

export { reachableTopOf };
