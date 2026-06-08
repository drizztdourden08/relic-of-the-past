/* @layer renderer-hud @kind types */
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

interface HudBoxProps extends HTMLAttributes<HTMLElement> {
  /** Element to render (default 'div'). Raw HTML lives here, in the HUD primitive. */
  as?: ElementType;
  /** Forwarded when rendering an interactive element (e.g. `as="button"`). */
  disabled?: boolean;
  children?: ReactNode;
}

export type { HudBoxProps };
