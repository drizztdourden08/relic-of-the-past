/* @layer renderer-components @kind logic */
/**
 * One rung ticked or unticked, and one family's order question answered, each
 * as a whole new setting. Written as pure edits so the block stays
 * presentational and the panel above it owns the values, the same contract
 * the shop scope's edits follow.
 */
import type {
  ProgressiveFamilyId, ProgressiveFamilyMode, ProgressiveModeSetting, ProgressiveSetting,
} from '@shared/randomizer/ap-world/progressive/progressive.type';

const withTierTicked = (
  setting: ProgressiveSetting, family: ProgressiveFamilyId, index: number, checked: boolean,
): ProgressiveSetting => ({
  ...setting,
  [family]: setting[family].map((current, position) => (position === index ? checked : current)),
});

const withFamilyMode = (
  modes: ProgressiveModeSetting, family: ProgressiveFamilyId, mode: ProgressiveFamilyMode,
): ProgressiveModeSetting => ({ ...modes, [family]: mode });

export { withFamilyMode, withTierTicked };
