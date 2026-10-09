/* @layer site-kit @kind types */
import type { CSSProperties, ReactNode } from 'react';

type LinkProps = {
  to: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  'aria-current'?: 'page';
};

export type { LinkProps };
