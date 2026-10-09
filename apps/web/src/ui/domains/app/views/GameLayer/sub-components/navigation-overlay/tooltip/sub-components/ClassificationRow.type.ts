/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface ClassificationRowProps {
  label: string;
  value: ReactNode;
  tag?: string;
  color?: string;
}

export type { ClassificationRowProps };
