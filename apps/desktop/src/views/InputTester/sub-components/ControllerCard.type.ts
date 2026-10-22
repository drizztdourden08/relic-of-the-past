/* @layer renderer-components @kind types */
import type { ControllerBusType, DeviceStickCalibration, TriggerCalibration, VibrateSegment } from '@drizztdourden08/brock-input';
import type { HapticPatternId, ResolvedDevice } from '@rotp/input-mapping';
import type { ControllerInputState } from '../../../input/controller-input-store';

interface ControllerCardProps {
  deviceKey: string;
  state: ControllerInputState;
  resolvedDevice: ResolvedDevice;
  hasStickCal?: boolean;
  existingStickCal?: DeviceStickCalibration | null;
  busType?: ControllerBusType;
  hasRumble?: boolean;
  onReportDevice?: (deviceKey: string) => void;
  hasGyro?: boolean;
  onStickCalibrationComplete?: (cal: DeviceStickCalibration) => void;
  onTriggerCalibrationComplete?: (deviceKey: string, axisIndex: number, cal: TriggerCalibration) => void;
}

type CalibrationTarget =
  | { type: 'stick'; side: 'left' | 'right' | 'both' }
  | { type: 'trigger'; axisIndex: number; label: string }
  | null;

type RumbleTest =
  | { label: string; steps: VibrateSegment[]; gapMs: number }
  | { label: string; hapticPattern: HapticPatternId };

interface RumbleTestButtonProps {
  deviceKey: string;
  test: RumbleTest;
}

interface CardCalibrationProps {
  deviceKey: string;
  target: CalibrationTarget;
  existingStickCal?: DeviceStickCalibration | null;
  onClose: () => void;
  onStickCalibrationComplete?: (cal: DeviceStickCalibration) => void;
  onTriggerCalibrationComplete?: (deviceKey: string, axisIndex: number, cal: TriggerCalibration) => void;
}

export type { CalibrationTarget, CardCalibrationProps, ControllerCardProps, RumbleTest, RumbleTestButtonProps };
