/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface MasterDetailLayoutProps {
  /** Left column (import form, list of ListItemRow, etc.). */
  list: ReactNode;
  /** Right column detail content. */
  detail: ReactNode;
  /** When true, the detail column is centered as an empty/placeholder state. */
  detailEmpty?: boolean;
  className?: string;
}

export type { MasterDetailLayoutProps };
