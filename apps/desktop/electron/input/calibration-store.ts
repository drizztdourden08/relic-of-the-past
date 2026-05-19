/**
 * Calibration persistence — stick and trigger calibration data per device.
 */

import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';

let userDataPath = '';

function initCalibrationStore(dataPath: string): void {
  userDataPath = dataPath;
}

function path(...segments: string[]): string {
  return join(userDataPath, 'Data', ...segments);
}

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

async function readStickCalibration(): Promise<StickCalibrationStore> {
  try {
    const data = await readFile(path(STICK_CAL_FILE), 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeStickCalibration(store: StickCalibrationStore): Promise<void> {
  await writeFile(path(STICK_CAL_FILE), JSON.stringify(store, null, 2), 'utf-8');
}

// ── Trigger calibration ──

const TRIGGER_CAL_FILE = 'trigger-calibration.json';

async function readTriggerCalibration(): Promise<Record<string, { base: number; max: number; deadzone: number }>> {
  try {
    const data = await readFile(path(TRIGGER_CAL_FILE), 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeTriggerCalibration(
  deviceKey: string, axisIndex: number,
  cal: { base: number; max: number; deadzone: number },
): Promise<void> {
  const store = await readTriggerCalibration();
  store[`${deviceKey}:${axisIndex}`] = cal;
  await writeFile(path(TRIGGER_CAL_FILE), JSON.stringify(store, null, 2), 'utf-8');
}

export {
  initCalibrationStore,
  readStickCalibration,
  readTriggerCalibration,
  writeStickCalibration,
  writeTriggerCalibration
};
export type { DeviceStickCalibration, StickCalibrationData, StickCalibrationStore };
