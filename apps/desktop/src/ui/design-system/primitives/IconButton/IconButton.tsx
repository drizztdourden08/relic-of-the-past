/* @layer renderer-components @kind component */
﻿import './IconButton.css';
import { type IconButtonProps } from './IconButton.type';

const IconButton = (props: IconButtonProps) => {
  const { variant = 'ghost', size = 'sm', active = false, label, children, className = '', ...rest } = props;
  const activeClass = active ? ' icon-btn--active' : '';

  return (
    <button
      className={`icon-btn icon-btn--${variant} icon-btn--${size}${activeClass} ${className}`}
      aria-label={label}
      aria-pressed={active}
      {...rest}
    >
      {children}
    </button>
  );
};

export {
  IconButton,
};
