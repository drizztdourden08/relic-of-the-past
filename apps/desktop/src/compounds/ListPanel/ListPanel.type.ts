/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

type ListPanelSide = 'start' | 'end';

interface ListPanelProps {
  title: string;
  side?: ListPanelSide;
  action: ReactNode;
  rail: ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

interface StoredFold {
  collapsed: boolean;
  toggle: () => void;
  expand: () => void;
}

export type { ListPanelProps, ListPanelSide, StoredFold };
