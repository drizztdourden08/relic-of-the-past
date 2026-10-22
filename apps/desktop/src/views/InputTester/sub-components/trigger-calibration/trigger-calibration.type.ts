/* @layer renderer-components @kind types */
import type { TriggerCalibration } from '@drizztdourden08/brock-input';
import type { useTriggerCalibration } from './behavior/useTriggerCalibration';

type Step = 'rest' | 'max' | 'review';

interface UseTriggerCalibrationOptions {
  axisIndex: number;
  deviceKey?: string;
  existingCalibration?: TriggerCalibration | null;
}

interface UseTriggerReadingsOptions extends UseTriggerCalibrationOptions {
  step: Step;
}

interface TriggerCalibrationWizardProps {
  axisIndex: number;
  label: string;
  onComplete: (cal: TriggerCalibration) => void;
  onCancel: () => void;
  existingCalibration?: TriggerCalibration | null;
  deviceKey?: string;
}

interface TriggerBarProps {
  value: number;
  label: string;
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
  onComplete: (cal: TriggerCalibration) => void;
}

export type {
  Step, TriggerBarProps, TriggerCalibrationWizardProps, TriggerRestStepProps,
  TriggerReviewStepProps, TriggerStepProps, UseTriggerCalibrationOptions, UseTriggerReadingsOptions,
};
