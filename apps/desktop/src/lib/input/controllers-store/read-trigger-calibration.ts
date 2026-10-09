/* @layer renderer-lib @kind logic */
import * as calibration from '@shared/storage/calibration';
import type { TriggerCal } from '@shared/storage/calibration';
import { getPlatform } from '@app/platform/get-platform';

const readTriggerCalibration = (): Promise<Record<string, TriggerCal>> => calibration.readTrigger(getPlatform().files);

export { readTriggerCalibration };
