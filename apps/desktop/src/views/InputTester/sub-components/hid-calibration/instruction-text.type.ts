/* @layer renderer-components @kind types */
import type { AxisSubStep, CaptureState, InputItem } from './hid-calibration.type';

interface InstructionTextArgs {
  inputPhaseActive: boolean;
  items: InputItem[];
  activeIndex: number;
  captureState: CaptureState;
  axisSubStep: AxisSubStep;
}

export type { InstructionTextArgs };
