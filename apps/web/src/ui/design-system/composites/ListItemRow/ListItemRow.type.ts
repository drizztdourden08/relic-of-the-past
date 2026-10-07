/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface ListItemRowProps {
  name: ReactNode;
  icon?: ReactNode;
  meta?: ReactNode;
  /** Right-aligned marker, always shown and centred on the row, before the action. */
  badge?: ReactNode;
  /** Right-aligned action slot (revealed on hover). */
  action?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
}

export type { ListItemRowProps };
