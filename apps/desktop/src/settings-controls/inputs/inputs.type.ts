/* @layer renderer-app @kind types */
interface ToggleControlProps {
  settingKey: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
  hints?: { on?: string; off?: string };
}

interface SliderControlProps {
  settingKey: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  disabled?: boolean;
}

interface ChoiceControlProps {
  settingKey: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  look: 'segmented' | 'select';
  disabled?: boolean;
}

export type { ChoiceControlProps, SliderControlProps, ToggleControlProps };
