/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  placement?: 'top' | 'bottom';
  children: ReactNode;
  className?: string;
}

export type { TooltipProps };
