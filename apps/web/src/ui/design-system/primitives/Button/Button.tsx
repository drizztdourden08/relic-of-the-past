/* @layer renderer-components @kind component */
﻿import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './Button.css';
import { type ButtonVariant, type ButtonSize, type ButtonProps } from './Button.type';



const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { variant = 'tertiary', size = 'md', fullWidth = false, active = false, busy = false, icon, children, className = '', disabled, ...rest } = props;

  const cls = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    active && 'btn--active',
    busy && 'btn--busy',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button ref={ref} className={cls} aria-pressed={active || undefined} aria-busy={busy || undefined} disabled={disabled || busy} {...rest}>
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
});

export {
  Button,
};
