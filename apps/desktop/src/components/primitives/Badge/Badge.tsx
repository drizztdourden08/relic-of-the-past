import type { ReactNode } from 'react';
import './Badge.css';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = 'neutral', children }: BadgeProps): JSX.Element {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
