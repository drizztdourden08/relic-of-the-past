/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';
import { writeJson } from '../../lib/json-store';
import { STICK_CAL_FILE } from './calibration-store.constants';
import type { StickCalibrationStore } from './calibration-store.type';

const writeStickCalibration = (store: StickCalibrationStore): Promise<void> =>
  writeJson(getUserDataPath(STICK_CAL_FILE), store);

export { writeStickCalibration };
