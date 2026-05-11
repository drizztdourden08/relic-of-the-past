import type { SelectHTMLAttributes } from 'react';
import './Select.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className = '', children, ...props }: SelectProps): JSX.Element {
  return (
    <select className={`select ${className}`} {...props}>
      {children}
    </select>
  );
}
