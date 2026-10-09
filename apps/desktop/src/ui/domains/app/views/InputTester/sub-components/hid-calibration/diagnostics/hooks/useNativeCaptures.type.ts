/* @layer renderer-components @kind types */
import type { JoystickInfo } from '@drizztdourden08/brock-input';

interface NativeCaptureStatus {
  rawAvailable: boolean;
  rawUnavailableReason: string | null;
  mappingString: string | null;
  joystickCounts: JoystickInfo | null;
}

export type { NativeCaptureStatus };
