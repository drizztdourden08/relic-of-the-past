/* @layer renderer-components @kind types */
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';

interface LadderStepperRung {
  key: string;
  label: string;
  index: number;
  checked: boolean;
  sprite?: string;
}

interface LadderStepperModel {
  name: string;
  countText: string;
  rungs: readonly LadderStepperRung[];
  noneOn: boolean;
  mode: string;
}

interface LadderStepperProps {
  ladder: LadderStepperModel;
  modeOptions: readonly SegmentOption[];
  modeLabel: string;
  disabled: boolean;
  readout?: boolean;
  onRungChange?: (index: number, checked: boolean) => void;
  onModeChange?: (mode: string) => void;
}

export type { LadderStepperModel, LadderStepperProps, LadderStepperRung };
