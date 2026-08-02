/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  /** Accessible name for a box whose visible label is drawn somewhere else. */
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export type { CheckboxProps };
