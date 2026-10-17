/* @layer renderer-components @kind types */
import type { ProgressiveRungModel } from '../ProgressiveLadder.type';

interface LadderRungProps {
  rung: ProgressiveRungModel;
  ordered: boolean;
  disabled: boolean;
  readout: boolean;
  onChange?: (index: number, checked: boolean) => void;
}

export type { LadderRungProps };
