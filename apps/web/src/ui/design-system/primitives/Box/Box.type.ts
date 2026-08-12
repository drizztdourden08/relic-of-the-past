/* @layer renderer-components @kind types */
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

interface BoxProps extends HTMLAttributes<HTMLElement> {
  /** Element to render (default 'div'). Raw HTML lives here, in the primitive. */
  as?: ElementType;
  /** Forwarded when rendering an interactive element (e.g. `as="button"`). */
  disabled?: boolean;
  /** Forwarded when rendering an anchor (e.g. `as="a"`). */
  href?: string;
  /** Forwarded when rendering a details element (e.g. `as="details"`). */
  open?: boolean;
  children?: ReactNode;
}

export type { BoxProps };
