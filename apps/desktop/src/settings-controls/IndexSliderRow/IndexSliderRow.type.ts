/* @layer renderer-app @kind types */
interface IndexSliderRowProps {
  settingKey: string;
  index: number;
  count: number;
  formatIndex: (index: number) => string;
  onIndex: (index: number) => void;
  disabled: boolean;
}

interface StopSliderInput {
  settingKey: string;
  stops: readonly number[];
  value: number;
  format: (stop: number) => string;
  onStop: (stop: number) => void;
  disabled: boolean;
}

export type { IndexSliderRowProps, StopSliderInput };
