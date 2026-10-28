/* @layer website-site @kind types */
import type { ReactNode } from 'react';

type ExpandableProps = {
  aspect: number;
  label: string;
  expanded: ReactNode;
  zoomable?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
};

export type { ExpandableProps };
