import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './IconButton.css';

type IconButtonVariant = 'ghost' | 'danger';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: 'sm' | 'md';
  label: string;
  children: ReactNode;
}

export function IconButton({
  variant = 'ghost',
  size = 'sm',
  label,
  children,
  className = '',
  ...props
}: IconButtonProps): JSX.Element {
  return (
    <button
      className={`icon-btn icon-btn--${variant} icon-btn--${size} ${className}`}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
}
