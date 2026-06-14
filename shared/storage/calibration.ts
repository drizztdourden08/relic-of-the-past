/* @layer shared-storage @kind logic */
/** Global controller calibration over FileStore (stick/trigger-calibration.json at the Data root). */
import type { FileStore } from '@shared/platform';
import { readJson, writeJson } from './json';

interface TriggerCal { base: number; max: number; deadzone: number }

const STICK = 'stick-calibration.json';
const TRIGGER = 'trigger-calibration.json';

const readStick = (files: FileStore): Promise<Record<string, unknown>> => readJson<Record<string, unknown>>(files, STICK, {});
const writeStick = (files: FileStore, store: Record<string, unknown>): Promise<void> => writeJson(files, STICK, store);

const readTrigger = (files: FileStore): Promise<Record<string, TriggerCal>> => readJson<Record<string, TriggerCal>>(files, TRIGGER, {});
const writeTrigger = async (files: FileStore, deviceKey: string, axisIndex: number, cal: TriggerCal): Promise<void> => {
  const store = await readTrigger(files);
  store[`${deviceKey}:${axisIndex}`] = cal;
  await writeJson(files, TRIGGER, store);
};

export { readStick, writeStick, readTrigger, writeTrigger };
export type { TriggerCal };
