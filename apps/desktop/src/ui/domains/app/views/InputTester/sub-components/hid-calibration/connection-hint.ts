/* @layer renderer-components @kind logic */
import type { ControllerBusType } from '@shared/ipc';
import type { ConnectionHint } from './hid-calibration.type';

const guessConnectionHint = (busType: ControllerBusType | null | undefined): ConnectionHint => busType ?? 'unknown';

export { guessConnectionHint };
