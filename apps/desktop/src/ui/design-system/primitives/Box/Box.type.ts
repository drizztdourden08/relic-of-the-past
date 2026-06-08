/* @layer renderer-components @kind types */
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

interface BoxProps extends HTMLAttributes<HTMLElement> {
  /** Element to render (default 'div'). Raw HTML lives here, in the primitive. */
  as?: ElementType;
  children?: ReactNode;
}

export type { BoxProps };
