/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { TooltipTone } from '@app/navigation-overlay/tooltip/tooltip.type';

interface ClassificationRowProps {
  label: string;
  value: ReactNode;
  tag?: string;
  tone?: TooltipTone;
}

export type { ClassificationRowProps };
