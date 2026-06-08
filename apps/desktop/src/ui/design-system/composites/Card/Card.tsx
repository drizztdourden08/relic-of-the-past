/* @layer renderer-components @kind component */
﻿import type { ReactNode, HTMLAttributes } from 'react';
import './Card.css';
import { type CardProps } from './types';


const Card = (props: CardProps) => {
  const { variant = 'default', children, className = '', ...rest } = props;

  return (
    <div className={`card card--${variant} ${className}`} {...rest}>
      {children}
    </div>
  );
};

export {
  Card,
};
