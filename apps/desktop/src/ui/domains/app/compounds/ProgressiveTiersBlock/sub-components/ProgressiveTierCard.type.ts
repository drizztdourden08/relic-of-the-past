/* @layer renderer-components @kind types */
import type { ProgressiveFamilyMode } from '@shared/randomizer/world/progressive/progressive.type';
import type { ProgressiveCardModel } from '../ProgressiveTiersBlock.type';

interface ProgressiveTierCardProps {
  card: ProgressiveCardModel;
  disabled: boolean;
  readout?: boolean;
  onTierChange?: (index: number, checked: boolean) => void;
  onModeChange?: (mode: ProgressiveFamilyMode) => void;
}

export type { ProgressiveTierCardProps };
