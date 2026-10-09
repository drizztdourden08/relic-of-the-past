/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface DisabledReasonProps {
  active: boolean;
  reason: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

export type { DisabledReasonProps };
