/* @layer electron-main @kind logic */
import { getUserDataPath, writeJsonFile } from '@drizztdourden08/brock-electron/main';
import { STICK_CAL_FILE } from './calibration-store.constants';
import type { StickCalibrationStore } from './calibration-store.type';

const writeStickCalibration = (store: StickCalibrationStore): Promise<void> =>
  writeJsonFile(getUserDataPath(STICK_CAL_FILE), store);

export { writeStickCalibration };
