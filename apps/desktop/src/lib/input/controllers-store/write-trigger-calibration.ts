/* @layer renderer-lib @kind logic */
import * as calibration from '@shared/storage/calibration';
import type { TriggerCal } from '@shared/storage/calibration';
import { getPlatform } from '@drizztdourden08/brock-react';

const writeTriggerCalibration = (deviceKey: string, axisIndex: number, cal: TriggerCal): Promise<void> =>
  calibration.writeTrigger(getPlatform().files, deviceKey, axisIndex, cal);

export { writeTriggerCalibration };
