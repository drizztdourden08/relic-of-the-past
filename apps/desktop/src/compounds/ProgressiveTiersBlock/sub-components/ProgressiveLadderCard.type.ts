/* @layer renderer-components @kind types */
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { ProgressiveLadder } from '../behavior/progressive-ladders.type';

interface ProgressiveLadderCardProps {
  ladder: ProgressiveLadder;
  modeOptions: readonly SegmentOption[];
  modeLabel: string;
  disabled: boolean;
  readout?: boolean;
  onRungChange?: (index: number, checked: boolean) => void;
  onModeChange?: (mode: string) => void;
}

export type { ProgressiveLadderCardProps };
