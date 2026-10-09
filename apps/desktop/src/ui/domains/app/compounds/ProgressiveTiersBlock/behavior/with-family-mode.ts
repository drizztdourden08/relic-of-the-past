/* @layer renderer-components @kind logic */
import type { ProgressiveFamilyId, ProgressiveFamilyMode, ProgressiveModeSetting } from '@rotp/randomizer';

const withFamilyMode = (
  modes: ProgressiveModeSetting, family: ProgressiveFamilyId, mode: ProgressiveFamilyMode,
): ProgressiveModeSetting => ({ ...modes, [family]: mode });

export { withFamilyMode };
