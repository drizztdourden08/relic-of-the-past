/* @layer renderer-components @kind types */
﻿import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'danger';
  children: ReactNode;
}

export type {
  CardProps,
};
