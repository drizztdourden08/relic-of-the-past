/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface AxisReadoutProps {
  name: string;
  variant: 'stick' | 'trigger';
  plot?: ReactNode;
  actions: ReactNode;
  children: ReactNode;
}

export type { AxisReadoutProps };
