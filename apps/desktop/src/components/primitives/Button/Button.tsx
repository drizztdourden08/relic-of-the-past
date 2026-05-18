import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import './Button.css';
import { type ButtonVariant, type ButtonSize, type ButtonProps } from './types';



const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { variant = 'secondary', size = 'md', fullWidth = false, icon, children, className = '', ...rest } = props;

  const cls = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button ref={ref} className={cls} {...rest}>
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
});

export {
  Button,
};
