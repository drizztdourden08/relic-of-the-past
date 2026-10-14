/* @layer renderer-lib @kind logic */
import { useCalibrationStore } from '@drizztdourden08/brock-input/renderer';
import { log } from '../../log-bus';
import { errorMessage } from '../../storage/error-message';

const loadCalibrations = (): void => {
  useCalibrationStore.getState().refresh()
    .catch((e: unknown) => log.app(`[input] failed to load controller calibration: ${errorMessage(e)}`, 'warn'));
};

export { loadCalibrations };
