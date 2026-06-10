/* @layer electron-main @kind logic */
/**
 * Calibration persistence — stick and trigger calibration data per device.
 */

import { getUserDataPath } from '../lib/paths';
import { readJson, writeJson } from '../lib/json-store';

const path = (...segments: string[]): string => getUserDataPath(...segments);

// ── Stick calibration ──

interface StickCalibrationData {
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  innerDeadzone: number;
  outerDeadzone: number;
}

interface DeviceStickCalibration {
  left: StickCalibrationData;
  right: StickCalibrationData;
  updatedAt: string;
}

/** All stick calibrations keyed by "vid:pid" */
type StickCalibrationStore = Record<string, DeviceStickCalibration>;

const STICK_CAL_FILE = 'stick-calibration.json';

const readStickCalibration = (): Promise<StickCalibrationStore> =>
  readJson<StickCalibrationStore>(path(STICK_CAL_FILE), {});

const writeStickCalibration = (store: StickCalibrationStore): Promise<void> =>
  writeJson(path(STICK_CAL_FILE), store);

// ── Trigger calibration ──

type TriggerCalibration = { base: number; max: number; deadzone: number };
type TriggerCalibrationStore = Record<string, TriggerCalibration>;

const TRIGGER_CAL_FILE = 'trigger-calibration.json';

const readTriggerCalibration = (): Promise<TriggerCalibrationStore> =>
  readJson<TriggerCalibrationStore>(path(TRIGGER_CAL_FILE), {});

const writeTriggerCalibration = async (deviceKey: string, axisIndex: number, cal: TriggerCalibration): Promise<void> => {
  const store = await readTriggerCalibration();
  store[`${deviceKey}:${axisIndex}`] = cal;
  await writeJson(path(TRIGGER_CAL_FILE), store);
};

export {
  readStickCalibration,
  readTriggerCalibration,
  writeStickCalibration,
  writeTriggerCalibration
};
export type { DeviceStickCalibration, StickCalibrationData, StickCalibrationStore };
