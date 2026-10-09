/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { writeJson } from '../json';
import { TRIGGER_CALIBRATION_FILE } from './calibration.constants';
import type { TriggerCal } from './calibration.type';
import { readTrigger } from './read-trigger';

const writeTrigger = async (files: FileStore, deviceKey: string, axisIndex: number, cal: TriggerCal): Promise<void> => {
  const store = await readTrigger(files);
  store[`${deviceKey}:${axisIndex}`] = cal;
  await writeJson(files, TRIGGER_CALIBRATION_FILE, store);
};

export { writeTrigger };
