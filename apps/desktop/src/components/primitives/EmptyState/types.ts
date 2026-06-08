/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface EmptyStateProps {
  message: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export type { EmptyStateProps };
