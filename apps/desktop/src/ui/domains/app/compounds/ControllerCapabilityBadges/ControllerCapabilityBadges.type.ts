/* @layer renderer-components @kind types */
import type { ControllerBusType } from '@shared/ipc';

interface ControllerCapabilityBadgesProps {
  busType?: ControllerBusType;
  hasRumble?: boolean;
  hasGyro?: boolean;
}

export type { ControllerCapabilityBadgesProps };
