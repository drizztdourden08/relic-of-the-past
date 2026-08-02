/* @layer renderer-components @kind component */
﻿import type { ReactNode } from 'react';
import './Badge.css';
import { type BadgeVariant, type BadgeProps } from './Badge.type';



const Badge = (props: BadgeProps) => {
  const { variant = 'neutral', className = '', children } = props;

  return <span className={`badge badge--${variant}${className ? ` ${className}` : ''}`}>{children}</span>;
};

export {
  Badge,
};
