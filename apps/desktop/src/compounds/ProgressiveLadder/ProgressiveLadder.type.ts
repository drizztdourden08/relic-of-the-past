/* @layer renderer-components @kind types */
import type { ProgressiveFamilyId, ProgressiveFamilyMode } from '@rotp/randomizer';

interface ProgressiveRungModel {
  key: string;
  label: string;
  index: number;
  checked: boolean;
  sprite?: string;
}

interface ProgressiveLadderModel {
  id: ProgressiveFamilyId;
  name: string;
  countText: string;
  rungs: ProgressiveRungModel[];
  noneOn: boolean;
  mode: ProgressiveFamilyMode;
}

interface ProgressiveLadderProps {
  ladder: ProgressiveLadderModel;
  disabled: boolean;
  readout?: boolean;
  onRungChange?: (index: number, checked: boolean) => void;
  onModeChange?: (mode: ProgressiveFamilyMode) => void;
}

export type { ProgressiveLadderModel, ProgressiveLadderProps, ProgressiveRungModel };
