interface RadioOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

interface RadioGroupProps<T extends string = string> {
  value: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  description?: string;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  name?: string;
}

export type {
  RadioOption,
  RadioGroupProps,
};
