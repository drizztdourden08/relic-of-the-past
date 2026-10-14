/* @layer renderer-components @kind logic */
import type { AxisSubStep, InputItem } from './hid-calibration.type';
import type { InstructionTextArgs } from './instruction-text.type';
import { AXIS_LABELS } from './hid-calibration.constants';

const axisInstruction = (item: InputItem, axisSubStep: AxisSubStep): string => {
  const info = AXIS_LABELS[item.id];
  if (axisSubStep === 'pos') return info?.pos ?? 'Push axis to positive extreme';
  return info?.neg ?? 'Push axis to negative extreme';
};

const getInstructionText = (args: InstructionTextArgs): string => {
  const { inputPhaseActive, items, activeIndex, captureState, axisSubStep } = args;
  if (!inputPhaseActive) return '';
  const item = items[activeIndex];
  if (!item) return '';
  if (item.status === 'captured') return `"${item.label}" captured. Click another button or click a byte to reassign.`;
  if (captureState === 'confirming-press') return `Detecting "${item.label}"...`;
  if (captureState === 'waiting-release') return `Got it. Release "${item.label}"...`;
  if (item.kind === 'button') return `Press "${item.label}" on controller, or click a byte in the grid to assign manually.`;
  return axisInstruction(item, axisSubStep);
};

export { getInstructionText };
