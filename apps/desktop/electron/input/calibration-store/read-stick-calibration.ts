/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';
import { readJson } from '../../lib/json-store';
import { STICK_CAL_FILE } from './calibration-store.constants';
import type { StickCalibrationStore } from './calibration-store.type';

const readStickCalibration = (): Promise<StickCalibrationStore> =>
  readJson<StickCalibrationStore>(getUserDataPath(STICK_CAL_FILE), {});

export { readStickCalibration };
