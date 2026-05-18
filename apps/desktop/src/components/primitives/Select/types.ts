import type { ReactNode, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
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

export interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export interface SelectItemProps {
  option: SelectOption;
  selected: boolean;
  highlighted: boolean;
  idx: number;
  onSelect: (val: string) => void;
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
}
