/* @layer renderer-lib @kind logic */
import { useCalibrationStore, controllerInputStore } from '@drizztdourden08/brock-input/renderer';
import { log } from '../../log-bus';
import { errorMessage } from '../../storage/error-message';

const logLoadedCalibrations = (): void => {
  const { sticks, triggers } = useCalibrationStore.getState();
  const stickCount = Object.keys(sticks).length;
  const triggerCount = Object.keys(triggers).length;
  if (stickCount > 0) controllerInputStore.log(`Loaded saved stick calibrations (${stickCount} profile(s))`);
  if (triggerCount > 0) controllerInputStore.log(`Loaded saved trigger calibrations (${triggerCount} entry(s))`);
};

const loadCalibrations = (): void => {
  useCalibrationStore.getState().refresh()
    .then(logLoadedCalibrations)
    .catch((e: unknown) => log.app(`[input] failed to load controller calibration: ${errorMessage(e)}`, 'warn'));
};

export { loadCalibrations };
