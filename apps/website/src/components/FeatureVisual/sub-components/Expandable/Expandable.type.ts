/* @layer website-site @kind types */
import type { ReactNode } from 'react';

type ExpandableProps = {
  aspect: number;
  label: string;
  expanded: ReactNode;
  zoomable?: boolean;
  className?: string;
  children: ReactNode;
};

export type { ExpandableProps };
