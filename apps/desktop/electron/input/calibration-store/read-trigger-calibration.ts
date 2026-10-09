/* @layer electron-main @kind logic */
import { getUserDataPath, readJsonFile } from '@drizztdourden08/brock-electron/main';
import { TRIGGER_CAL_FILE } from './calibration-store.constants';
import type { TriggerCalibrationStore } from './calibration-store.type';

const readTriggerCalibration = (): Promise<TriggerCalibrationStore> =>
  readJsonFile<TriggerCalibrationStore>(getUserDataPath(TRIGGER_CAL_FILE), {});

export { readTriggerCalibration };
