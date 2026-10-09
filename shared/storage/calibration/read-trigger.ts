/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { readJson } from '../json';
import { TRIGGER_CALIBRATION_FILE } from './calibration.constants';
import type { TriggerCal } from './calibration.type';

const readTrigger = (files: FileStore): Promise<Record<string, TriggerCal>> =>
  readJson<Record<string, TriggerCal>>(files, TRIGGER_CALIBRATION_FILE, {});

export { readTrigger };
