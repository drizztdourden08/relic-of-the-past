/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  /** Shown under the control in place of the hint; the label and the control turn red. */
  error?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  /** Lay the label beside the control instead of above it. */
  inline?: boolean;
  className?: string;
  children: ReactNode;
}

export type { FieldProps };
