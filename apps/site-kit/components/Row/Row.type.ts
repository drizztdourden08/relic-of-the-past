/* @layer site-kit @kind types */
import type { ReactNode } from 'react';

type RowProps = {
  label: ReactNode;
  value: ReactNode;
  action?: ReactNode;
  className?: string;
};

export type { RowProps };
