/* @layer renderer-components @kind logic */
import type { AxisSubStep, CaptureState, InputItem } from './hid-calibration.type';
import { AXIS_LABELS } from './hid-calibration.constants';

const getInstructionText = (inputPhaseActive: boolean, items: InputItem[], activeIndex: number, captureState: CaptureState, axisSubStep: AxisSubStep): string => {
  if (!inputPhaseActive) return '';
  const item = items[activeIndex];
  if (!item) return '';
  if (item.status === 'captured') return `"${item.label}" captured. Click another button or click a byte to reassign.`;
  if (captureState === 'confirming-press') return `Detecting "${item.label}"...`;
  if (captureState === 'waiting-release') return `Got it! Release "${item.label}"...`;
  if (item.kind === 'button') return `Press "${item.label}" on controller, or click a byte in the grid to assign manually.`;
  const info = AXIS_LABELS[item.id];
  if (axisSubStep === 'pos') return info?.pos ?? 'Push axis to positive extreme';
  return info?.neg ?? 'Push axis to negative extreme';
};

export { getInstructionText };
