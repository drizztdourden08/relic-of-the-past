/* @layer renderer-components @kind types */
interface StepperProps {
  value: number; // NaN renders as an empty field
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export type { StepperProps };
