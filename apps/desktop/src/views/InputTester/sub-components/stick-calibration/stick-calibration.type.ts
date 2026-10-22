/* @layer renderer-components @kind types */
import type { DeviceStickCalibration, StickCalibration } from '@drizztdourden08/brock-input';
import type { useStickCalibration } from './behavior/useStickCalibration';

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
  large?: boolean;
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

interface StickQuad {
  lx: number;
  ly: number;
  rx: number;
  ry: number;
}

interface StickRangeBounds {
  lxMin: number;
  lxMax: number;
  lyMin: number;
  lyMax: number;
  rxMin: number;
  rxMax: number;
  ryMin: number;
  ryMax: number;
}

interface StickSamples {
  lx: number[];
  ly: number[];
  rx: number[];
  ry: number[];
}

interface StickBuildInput {
  calibrateLeft: boolean;
  calibrateRight: boolean;
  centerValues: StickQuad;
  rangeMinMax: StickRangeBounds;
  innerDz: number;
  outerDz: number;
  existingCalibration?: DeviceStickCalibration | null;
}

export type {
  CalibratedPoint, Step, StickBuildInput, StickCalibration, StickCalibrationWizardProps, StickCircleProps,
  StickQuad, StickRangeBounds, StickReviewStepProps, StickSamples, StickStepProps, UseStickCalibrationOptions,
};
