/* @layer renderer-components @kind types */
import type { JoystickInfo } from '@shared/ipc';

interface NativeCaptureStatus {
  rawAvailable: boolean;
  rawUnavailableReason: string | null;
  mappingString: string | null;
  joystickCounts: JoystickInfo | null;
}

export type { NativeCaptureStatus };
