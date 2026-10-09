/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

type PopoverShellProps = {
  label: string;
  align?: 'start' | 'end';
  keepFocus?: boolean;
  children: ReactNode;
};

export type { PopoverShellProps };
