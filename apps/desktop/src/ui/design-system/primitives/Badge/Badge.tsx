/* @layer renderer-components @kind component */
﻿import type { ReactNode } from 'react';
import './Badge.css';
import { type BadgeVariant, type BadgeProps } from './Badge.type';



const Badge = (props: BadgeProps) => {
  const { variant = 'neutral', children } = props;

  return <span className={`badge badge--${variant}`}>{children}</span>;
};

export {
  Badge,
};
