/* @layer renderer-components @kind types */
import type { ControllerBusType } from '@drizztdourden08/brock-input';

interface ControllerCapabilityBadgesProps {
  busType?: ControllerBusType;
  hasRumble?: boolean;
  hasGyro?: boolean;
}

export type { ControllerCapabilityBadgesProps };
