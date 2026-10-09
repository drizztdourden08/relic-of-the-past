/* @layer electron-main @kind logic */
import { getUserDataPath, readJsonFile } from '@drizztdourden08/brock-electron/main';
import { STICK_CAL_FILE } from './calibration-store.constants';
import type { StickCalibrationStore } from './calibration-store.type';

const readStickCalibration = (): Promise<StickCalibrationStore> =>
  readJsonFile<StickCalibrationStore>(getUserDataPath(STICK_CAL_FILE), {});

export { readStickCalibration };
