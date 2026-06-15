/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Edge the panel slides in from. */
  side?: 'left' | 'right' | 'top';
  label?: string;
  children: ReactNode;
}

export type { DrawerProps };
