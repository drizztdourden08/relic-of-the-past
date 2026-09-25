/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ControlSize } from '../control-size';

interface EmptyStateProps {
  message: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  /**
   * Density. Defaults to `md`, which is the 16px pad it draws today. `sm` exists for
   * the two call sites that sit in a 188px column, where a 16px pad on every
   * edge is a sixth of the width spent on emptiness.
   */
  size?: ControlSize;
}

export type { EmptyStateProps };
