/* @layer renderer-components @kind types */
interface NumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  icon?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export type { NumberFieldProps };
