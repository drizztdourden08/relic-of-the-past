/* @layer renderer-components @kind logic */
import type { ProgressiveFamilyId, ProgressiveSetting } from '@rotp/randomizer';

const withTierTicked = (
  setting: ProgressiveSetting, family: ProgressiveFamilyId, index: number, checked: boolean,
): ProgressiveSetting => ({
  ...setting,
  [family]: setting[family].map((current, position) => (position === index ? checked : current)),
});

export { withTierTicked };
