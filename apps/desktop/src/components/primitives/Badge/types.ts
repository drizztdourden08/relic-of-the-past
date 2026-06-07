/* @layer renderer-components @kind types */
﻿import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

export type {
  BadgeVariant,
  BadgeProps,
};
