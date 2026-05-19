import type { ReactNode, SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  size?: 'md' | 'sm';
  className?: string;
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
}

interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

interface SelectItemProps {
  option: SelectOption;
  selected: boolean;
  highlighted: boolean;
  idx: number;
  onSelect: (val: string) => void;
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
}

export type {
  NativeSelectProps,
  SelectGroup,
  SelectItemProps,
  SelectOption,
  SelectProps
};
