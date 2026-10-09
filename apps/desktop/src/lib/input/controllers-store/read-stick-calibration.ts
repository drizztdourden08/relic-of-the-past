/* @layer renderer-lib @kind logic */
import * as calibration from '@shared/storage/calibration';
import { getPlatform } from '@drizztdourden08/brock-react';

const readStickCalibration = (): Promise<Record<string, unknown>> => calibration.readStick(getPlatform().files);

export { readStickCalibration };
