/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';
import { writeJson } from '../../lib/json-store';
import { TRIGGER_CAL_FILE } from './calibration-store.constants';
import type { TriggerCalibration } from './calibration-store.type';
import { readTriggerCalibration } from './read-trigger-calibration';

const writeTriggerCalibration = async (deviceKey: string, axisIndex: number, cal: TriggerCalibration): Promise<void> => {
  const store = await readTriggerCalibration();
  store[`${deviceKey}:${axisIndex}`] = cal;
  await writeJson(getUserDataPath(TRIGGER_CAL_FILE), store);
};

export { writeTriggerCalibration };
