/* @layer renderer-components @kind types */
interface CalibrationStepDef<K extends string> {
  key: K;
  label: string;
}

interface CalibrationStepIndicatorProps<K extends string> {
  steps: readonly CalibrationStepDef<K>[];
  current: K;
}

interface CalibrationHeaderProps {
  title: string;
  onCancel: () => void;
}

interface SamplingProgressProps {
  progress: number;
}

interface DeadzoneSliderProps {
  title: string;
  value: number;
  min: number;
  max: number;
  note: string;
  onChange: (value: number) => void;
}

export type {
  CalibrationHeaderProps, CalibrationStepDef, CalibrationStepIndicatorProps,
  DeadzoneSliderProps, SamplingProgressProps,
};
