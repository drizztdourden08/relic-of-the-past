/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { SideNavProps } from '../SideNav';

interface SettingsShellProps {
  /** Left navigation config (searchable, grouped). */
  nav: SideNavProps;
  /** The right-hand scrollable panel content for the active nav item. */
  children: ReactNode;
  className?: string;
}

export type { SettingsShellProps };
