import type { ReactNode } from 'react';
import './Badge.css';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

export const Badge = (props: BadgeProps) => {
  const { variant = 'neutral', children } = props;

  return <span className={`badge badge--${variant}`}>{children}</span>;
};
