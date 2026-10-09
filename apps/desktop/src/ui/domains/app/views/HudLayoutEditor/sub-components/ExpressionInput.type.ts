/* @layer renderer-components @kind types */
interface ExpressionInputProps {
  value: string;
  onChange: (next: string) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  extraNames?: readonly string[];
  placeholder?: string;
  'aria-label'?: string;
}

export type { ExpressionInputProps };
