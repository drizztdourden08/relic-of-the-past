/* @layer renderer-components @kind component */
﻿import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './IconButton.css';
import { type IconButtonVariant, type IconButtonProps } from './IconButton.type';



const IconButton = (props: IconButtonProps) => {
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

export {
  IconButton,
};
