/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

/**
 * How many columns a panel takes: one, two once the dashboard holds two
 * (one below that), or the whole row at every width.
 */
type DashboardSpan = 1 | 2 | 'full';

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

interface DashboardPanelProps {
  title: ReactNode;
  /** A short line under the title. */
  subtitle?: ReactNode;
  /** At the right end of the header: a chip, a count, a button. */
  action?: ReactNode;
  span?: DashboardSpan;
  /** The page's section anchor for this panel (`data-section`). */
  section?: string;
  className?: string;
  children?: ReactNode;
}

export type { DashboardGridProps, DashboardPanelProps, DashboardSpan };
