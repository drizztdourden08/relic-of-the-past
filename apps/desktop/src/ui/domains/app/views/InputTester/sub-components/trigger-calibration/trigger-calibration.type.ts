/* @layer renderer-components @kind types */
import type { useTriggerCalibration } from './useTriggerCalibration';

interface TriggerCalibrationData {
  base: number;
  max: number;
  deadzone: number;
}

type Step = 'rest' | 'max' | 'review';

interface UseTriggerCalibrationOptions {
  axisIndex: number;
  deviceKey?: string;
  existingCalibration?: TriggerCalibrationData | null;
}

interface TriggerCalibrationWizardProps {
  axisIndex: number;
  label: string;
  onComplete: (cal: TriggerCalibrationData) => void;
  onCancel: () => void;
  existingCalibration?: TriggerCalibrationData | null;
  deviceKey?: string;
}

interface TriggerBarProps {
  value: number;
  label: string;
  height?: number;
  step: Step;
  deadzone: number;
}

type TriggerCalibrationState = ReturnType<typeof useTriggerCalibration>;

interface TriggerStepProps {
  cal: TriggerCalibrationState;
  label: string;
}

interface TriggerRestStepProps extends TriggerStepProps {
  axisIndex: number;
}

interface TriggerReviewStepProps {
  cal: TriggerCalibrationState;
  onComplete: (cal: TriggerCalibrationData) => void;
}

export type {
  Step,
  TriggerBarProps,
  TriggerCalibrationData,
  TriggerCalibrationState,
  TriggerCalibrationWizardProps,
  TriggerRestStepProps,
  TriggerReviewStepProps,
  TriggerStepProps,
  UseTriggerCalibrationOptions,
};
