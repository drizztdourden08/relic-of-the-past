import type { ReactNode, HTMLAttributes } from 'react';
import './Card.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'danger';
  children: ReactNode;
}

export const Card = (props: CardProps) => {
  const { variant = 'default', children, className = '', ...rest } = props;

  return (
    <div className={`card card--${variant} ${className}`} {...rest}>
      {children}
    </div>
  );
};
