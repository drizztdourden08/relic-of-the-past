/* @layer renderer-components @kind types */
import type {
  DeviceEntry, DeviceStickCalibration, PadState, TriggerCalibration, VibrateSegment,
} from '@drizztdourden08/brock-input';
import type { ControllerInputState, HapticPatternId, ResolvedControl, ResolvedDevice } from '@rotp/input-mapping';
import type { StickPairGroup } from '@app/input/resolved-axis-groups/resolved-axis-groups.type';
import type { OverlayAnchor, OverlaySlotView, PadOverlayState } from '@app/composites/PadOverlay';

interface ControllerPageProps {
  deviceKey: string;
  gone?: boolean;
  onRunDiagnostics?: (deviceKey: string) => void;
}

interface PadOverlayModel {
  outline: string;
  anchors: readonly OverlayAnchor[];
  slots: readonly OverlaySlotView[];
}

interface ControllerCalibration {
  existingStickCal: DeviceStickCalibration | null;
  onStickComplete: (calibration: DeviceStickCalibration) => void;
  onTriggerComplete: (axisIndex: number, calibration: TriggerCalibration) => void;
}

interface ControllerPageModel {
  deviceKey: string;
  entry: DeviceEntry;
  name: string;
  idLabel: string;
  brandIcon: string | null;
  resolved: ResolvedDevice | null;
  adapterPort: number | null;
  state: ControllerInputState;
  pad: PadState;
  overlay: PadOverlayModel | null;
  overlayState: PadOverlayState;
  calibration: ControllerCalibration;
  addMapping: (mapping: string) => Promise<boolean>;
}

interface BoxProps {
  page: ControllerPageModel;
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
  disabled: boolean;
}

interface RumbleStrengthControlProps {
  deviceKey: string;
  disabled: boolean;
}

interface CardCalibrationProps {
  deviceKey: string;
  target: CalibrationTarget;
  existingStickCal: DeviceStickCalibration | null;
  onClose: () => void;
  onStickComplete: (calibration: DeviceStickCalibration) => void;
  onTriggerComplete: (axisIndex: number, calibration: TriggerCalibration) => void;
}

interface AxisActionsProps {
  label: string;
  getValues: () => number[];
  onCalibrate: () => void;
}

interface PageHeadProps {
  page: ControllerPageModel;
  onRunDiagnostics: ((deviceKey: string) => void) | undefined;
  onReport: (deviceKey: string) => void;
}

interface RumbleTestsProps {
  deviceKey: string;
  hasRumble: boolean;
}

interface StickReadoutProps {
  pair: StickPairGroup;
  pairIdx: number;
  state: ControllerInputState;
  onCalibrate: (target: CalibrationTarget) => void;
}

interface TriggerReadoutProps {
  trigger: ResolvedControl;
  state: ControllerInputState;
  onCalibrate: (target: CalibrationTarget) => void;
}

export type {
  AxisActionsProps, BoxProps, CalibrationTarget, CardCalibrationProps, ControllerCalibration, ControllerPageModel, ControllerPageProps, PadOverlayModel,
  PageHeadProps, RumbleStrengthControlProps, RumbleTest, RumbleTestButtonProps, RumbleTestsProps, StickReadoutProps, TriggerReadoutProps,
};
