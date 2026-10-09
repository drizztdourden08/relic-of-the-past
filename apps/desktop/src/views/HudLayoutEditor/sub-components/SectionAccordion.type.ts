/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface SectionAccordionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  boundCount?: number;
  note?: string;
  children: ReactNode;
}

export type { SectionAccordionProps };
