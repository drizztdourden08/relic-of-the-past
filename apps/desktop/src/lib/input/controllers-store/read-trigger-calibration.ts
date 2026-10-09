/* @layer renderer-lib @kind logic */
import * as calibration from '@shared/storage/calibration';
import type { TriggerCal } from '@shared/storage/calibration';
import { getPlatform } from '@drizztdourden08/brock-react';

const readTriggerCalibration = (): Promise<Record<string, TriggerCal>> => calibration.readTrigger(getPlatform().files);

export { readTriggerCalibration };
