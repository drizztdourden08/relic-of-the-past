/* @layer renderer-components @kind types */
import type { ControllerInputState, DeviceStickCalibration } from '../../../../../../lib/input/controller-input-store';
import type { ResolvedDevice } from '@shared/input/family';
import type { ControllerBusType } from '@shared/ipc';
import type { VibrateStep } from '@shared/platform';
import type { TriggerCalibrationData } from './TriggerCalibrationWizard';

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
  onTriggerCalibrationComplete?: (deviceKey: string, axisIndex: number, cal: TriggerCalibrationData) => void;
}

type CalibrationTarget =
  | { type: 'stick'; side: 'left' | 'right' | 'both' }
  | { type: 'trigger'; axisIndex: number; label: string }
  | null;

type RumbleTest =
  | { label: string; steps: VibrateStep[]; gapMs: number }
  | { label: string; hapticPattern: 'swordHitEnemy' };

interface RumbleTestButtonProps {
  deviceKey: string;
  test: RumbleTest;
}

export type { CalibrationTarget, ControllerCardProps, RumbleTest, RumbleTestButtonProps };
