/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';
import { readJson } from '../../lib/json-store';
import { TRIGGER_CAL_FILE } from './calibration-store.constants';
import type { TriggerCalibrationStore } from './calibration-store.type';

const readTriggerCalibration = (): Promise<TriggerCalibrationStore> =>
  readJson<TriggerCalibrationStore>(getUserDataPath(TRIGGER_CAL_FILE), {});

export { readTriggerCalibration };
