/* @layer renderer-lib @kind logic */
import * as calibration from '@shared/storage/calibration';
import { getPlatform } from '@app/platform/get-platform';

const writeStickCalibration = (store: Record<string, unknown>): Promise<void> => calibration.writeStick(getPlatform().files, store);

export { writeStickCalibration };
