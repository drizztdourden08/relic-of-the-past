/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { readJson } from '../json';
import { STICK_CALIBRATION_FILE } from './calibration.constants';

const readStick = (files: FileStore): Promise<Record<string, unknown>> =>
  readJson<Record<string, unknown>>(files, STICK_CALIBRATION_FILE, {});

export { readStick };
