/* @layer renderer-components @kind logic */
import type { ByteColorKey } from '../hid-calibration.type';
import { getInstructionText } from '../instruction-text';
import { getByteColorKey } from '../wizard-helpers';
import type { WizardGettersParams } from './hid-calibration-hook.type';

const wizardGetters = (params: WizardGettersParams) => {
  const { itemState, byteStatuses, gyroIdle } = params;

  return {
    getInstruction: (): string => getInstructionText({
      inputPhaseActive: itemState.inputPhaseActive,
      items: itemState.items,
      activeIndex: itemState.activeIndex,
      captureState: itemState.captureState,
      axisSubStep: itemState.axisSubStep,
    }),
    getByteColorKey: (idx: number): ByteColorKey => getByteColorKey(idx, byteStatuses, gyroIdle.gyroState, gyroIdle.gyroChangedBytes),
  };
};

export { wizardGetters };
