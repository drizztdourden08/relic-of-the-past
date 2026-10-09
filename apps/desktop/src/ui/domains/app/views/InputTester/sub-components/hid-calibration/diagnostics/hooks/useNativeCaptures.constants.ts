/* @layer renderer-components @kind constants */
import type { NativeCaptureStatus } from './useNativeCaptures.type';

const EMPTY_STATUS: NativeCaptureStatus = {
  rawAvailable: false, rawUnavailableReason: 'not-found', mappingString: null, joystickCounts: null,
};

export { EMPTY_STATUS };
