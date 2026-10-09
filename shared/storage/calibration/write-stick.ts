/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { writeJson } from '../json';
import { STICK_CALIBRATION_FILE } from './calibration.constants';

const writeStick = (files: FileStore, store: Record<string, unknown>): Promise<void> =>
  writeJson(files, STICK_CALIBRATION_FILE, store);

export { writeStick };
