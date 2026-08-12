/* @layer renderer-components @kind logic */
/**
 * USB-vs-Bluetooth for the current device. SDL reports the transport
 * directly on the controller-added event and the device snapshot (busType),
 * so that value is ground truth here, not a guess — this keeps the
 * historical name and one-argument shape because it is still the single
 * place calibrationMap.connectionHint gets resolved from.
 */
import type { ControllerBusType } from '@shared/ipc';
import type { ConnectionHint } from './hid-calibration.type';

const guessConnectionHint = (busType: ControllerBusType | null | undefined): ConnectionHint => busType ?? 'unknown';

export { guessConnectionHint };
