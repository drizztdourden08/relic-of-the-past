import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './IconButton.css';

export type IconButtonVariant = 'ghost' | 'danger';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: 'sm' | 'md';
  label: string;
  children: ReactNode;
}

export const IconButton = (props: IconButtonProps) => {
  const { variant = 'ghost', size = 'sm', label, children, className = '', ...rest } = props;

  return (
    <button
      className={`icon-btn icon-btn--${variant} icon-btn--${size} ${className}`}
      aria-label={label}
      {...rest}
    >
      {children}
    </button>
  );
};
