interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string = string> {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export type {
  SegmentOption,
  SegmentedControlProps,
};
