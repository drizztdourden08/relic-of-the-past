import type { ReactNode, HTMLAttributes } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'danger';
  children: ReactNode;
}

export function Card({
  variant = 'default',
  children,
  className = '',
  ...props
}: CardProps): JSX.Element {
  return (
    <div className={`card card--${variant} ${className}`} {...props}>
      {children}
    </div>
  );
}
