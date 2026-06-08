/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned action slot (buttons, counts, etc.). */
  action?: ReactNode;
  className?: string;
}

export type { SectionHeaderProps };
