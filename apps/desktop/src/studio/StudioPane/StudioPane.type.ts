/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { StudioActionGroup } from '../studio-action.type';

interface StudioPaneProps {
  label: string;
  actions: readonly StudioActionGroup[];
  status?: ReactNode;
  banner?: ReactNode;
  className?: string;
  children: ReactNode;
}

interface StudioActionRowProps {
  label: string;
  actions: readonly StudioActionGroup[];
  status?: ReactNode;
}

export type { StudioActionRowProps, StudioPaneProps };
