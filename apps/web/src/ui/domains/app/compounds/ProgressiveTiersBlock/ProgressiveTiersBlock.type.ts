/* @layer renderer-components @kind types */
import type {
  ProgressiveFamilyId, ProgressiveFamilyMode, ProgressiveModeSetting, ProgressiveSetting,
} from '@shared/randomizer/world/progressive/progressive.type';

interface ProgressiveTiersBlockProps {
  setting: ProgressiveSetting;
  modes: ProgressiveModeSetting;
  onChange?: (next: ProgressiveSetting) => void;
  onModesChange?: (next: ProgressiveModeSetting) => void;
}

interface ProgressiveTierToggleModel {
  key: string;
  label: string;
  index: number;
  checked: boolean;
}

interface ProgressiveCardModel {
  id: ProgressiveFamilyId;
  name: string;
  countText: string;
  tiers: ProgressiveTierToggleModel[];
  noneOn: boolean;
  mode: ProgressiveFamilyMode;
}

export type { ProgressiveCardModel, ProgressiveTierToggleModel, ProgressiveTiersBlockProps };
