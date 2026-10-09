/* @layer renderer-components @kind types */
import type { useStickCalibration } from './useStickCalibration';

interface StickCalibrationData {
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  innerDeadzone: number;
  outerDeadzone: number;
}

interface DeviceStickCalibration {
  left: StickCalibrationData;
  right: StickCalibrationData;
  updatedAt: string;
}

type Step = 'center' | 'range' | 'review';

type StickTarget = 'left' | 'right';

interface StickCalibrationWizardProps {
  onComplete: (cal: DeviceStickCalibration) => void;
  onCancel: () => void;
  existingCalibration?: DeviceStickCalibration | null;
  target?: StickTarget;
  deviceKey?: string;
}

interface UseStickCalibrationOptions {
  existingCalibration?: DeviceStickCalibration | null;
  target?: StickTarget;
  deviceKey?: string;
}

interface StickCircleProps {
  x: number;
  y: number;
  label: string;
  size?: number;
  innerDeadzone?: number;
  outerDeadzone?: number;
  showDeadzones?: boolean;
}

type StickCalibrationState = ReturnType<typeof useStickCalibration>;

interface StickStepProps {
  cal: StickCalibrationState;
  target?: StickTarget;
}

interface StickReviewStepProps {
  cal: StickCalibrationState;
  onComplete: (cal: DeviceStickCalibration) => void;
}

interface CalibratedPoint {
  x: number;
  y: number;
}

export type {
  CalibratedPoint,
  DeviceStickCalibration,
  Step,
  StickCalibrationData,
  StickCalibrationData as StickCal,
  StickCalibrationState,
  StickCalibrationWizardProps,
  StickCircleProps,
  StickReviewStepProps,
  StickStepProps,
  StickTarget,
  UseStickCalibrationOptions,
};
