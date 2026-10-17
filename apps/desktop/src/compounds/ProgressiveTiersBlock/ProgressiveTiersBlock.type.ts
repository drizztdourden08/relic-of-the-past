/* @layer renderer-components @kind types */
import type { ProgressiveModeSetting, ProgressiveSetting } from '@rotp/randomizer';

interface ProgressiveTiersBlockProps {
  setting: ProgressiveSetting;
  modes: ProgressiveModeSetting;
  spritesAvailable?: boolean;
  onChange?: (next: ProgressiveSetting) => void;
  onModesChange?: (next: ProgressiveModeSetting) => void;
}

export type { ProgressiveTiersBlockProps };
