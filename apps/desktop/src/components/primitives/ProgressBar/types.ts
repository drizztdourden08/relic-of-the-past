/* @layer renderer-components @kind types */
type ProgressVariant = 'gold' | 'green' | 'danger';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  /** Optional second (lighter) fill behind the main one, e.g. reachable-vs-done. */
  secondaryValue?: number;
  className?: string;
}

export type { ProgressBarProps, ProgressVariant };
