/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface SubsectionAction {
  label: string;
  icon: string;
  onClick: () => void;
}

interface SubsectionGroupProps {
  title: string;
  summary: string;
  swatch?: string;
  open: boolean;
  onToggle: () => void;
  enabled?: boolean;
  onEnabledChange?: (on: boolean) => void;
  action?: SubsectionAction;
  children: ReactNode;
}

export type { SubsectionAction, SubsectionGroupProps };
