/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { PanelPlacement } from '../Randomizer.type';

interface DashboardCardProps {
  placement?: PanelPlacement;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export type { DashboardCardProps };
