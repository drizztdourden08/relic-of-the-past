/* @layer renderer-components @kind types */
import type { ControllerBusType } from '@drizztdourden08/brock-input';
import type { HapticPatternId } from '@shared/input/data/haptics';
import type { ResolvedDevice } from '@shared/input/family';
import type { ControllerInputState } from '../../../../../../lib/input/controller-input-store';

interface ControllerCardProps {
  deviceKey: string;
  state: ControllerInputState;
  resolvedDevice: ResolvedDevice;
  busType?: ControllerBusType;
  hasRumble?: boolean;
  hasGyro?: boolean;
  onReportDevice?: (deviceKey: string) => void;
}

interface RumbleTest {
  label: string;
  hapticPattern: HapticPatternId;
}

interface RumbleTestButtonProps {
  deviceKey: string;
  test: RumbleTest;
}

export type { ControllerCardProps, RumbleTest, RumbleTestButtonProps };
