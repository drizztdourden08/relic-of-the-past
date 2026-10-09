/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: ReactNode;
  disabled?: boolean;
}

export type { ColorFieldProps };
