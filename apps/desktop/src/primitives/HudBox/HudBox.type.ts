/* @layer renderer-hud @kind types */
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type HudBoxLayout = 'relative' | 'at-origin' | 'at-bottom-left' | 'overlay';

interface HudBoxProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  disabled?: boolean;
  layout?: HudBoxLayout;
  children?: ReactNode;
}

export type { HudBoxLayout, HudBoxProps };
