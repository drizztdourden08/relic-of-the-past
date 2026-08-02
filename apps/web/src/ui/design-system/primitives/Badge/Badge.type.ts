/* @layer renderer-components @kind types */
﻿import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  /** Extra classes, so a caller can give the badge a surface of its own. */
  className?: string;
  children: ReactNode;
}

export type {
  BadgeVariant,
  BadgeProps,
};
