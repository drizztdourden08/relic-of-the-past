/* @layer site-kit @kind types */
import type { ReactNode } from 'react';

type WorkbenchProps = {
  toolbar: ReactNode;
  table: ReactNode;
  detail: ReactNode | null;
};

export type { WorkbenchProps };
