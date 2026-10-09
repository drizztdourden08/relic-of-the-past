/* @layer renderer-components @kind types */
interface NumberCellProps {
  label: string;
  value: number | undefined;
  onChange: (next: number | undefined) => void;
  readOnly?: boolean;
  title?: string;
  placeholder?: string;
  className: string;
}

export type { NumberCellProps };
