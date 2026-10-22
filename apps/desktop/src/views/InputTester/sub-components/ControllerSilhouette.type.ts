/* @layer renderer-components @kind types */
import type { PadFamily } from '@drizztdourden08/brock-input';
import type { ResolvedControl } from '@rotp/input-mapping';

interface ControllerSilhouetteProps {
  deviceKey: string;
  controls: readonly ResolvedControl[];
  family?: PadFamily;
  label: string;
}

export type { ControllerSilhouetteProps };
