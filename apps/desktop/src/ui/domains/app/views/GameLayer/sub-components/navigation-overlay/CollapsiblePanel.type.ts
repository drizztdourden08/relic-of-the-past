/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface CollapsiblePanelProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export type { CollapsiblePanelProps };
