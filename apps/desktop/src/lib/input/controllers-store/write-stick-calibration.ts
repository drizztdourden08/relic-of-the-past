/* @layer renderer-lib @kind logic */
import * as calibration from '@shared/storage/calibration';
import { getPlatform } from '@drizztdourden08/brock-react';

const writeStickCalibration = (store: Record<string, unknown>): Promise<void> => calibration.writeStick(getPlatform().files, store);

export { writeStickCalibration };
