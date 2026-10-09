/* @layer renderer-lib @kind logic */
import { useCalibrationStore } from '@drizztdourden08/brock-input/renderer';

const loadCalibrations = (): void => {
  useCalibrationStore.getState().refresh()
    .catch((e: unknown) => console.warn('[input] failed to load controller calibration', e));
};

export { loadCalibrations };
