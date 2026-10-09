/* @layer renderer-hud @kind types */
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

interface HudBoxProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  disabled?: boolean;
  children?: ReactNode;
}

export type { HudBoxProps };
