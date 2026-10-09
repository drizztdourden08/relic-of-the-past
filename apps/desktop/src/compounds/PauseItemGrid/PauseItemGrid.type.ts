/* @layer renderer-hud @kind types */
import type { CSSProperties } from 'react';

interface PauseItemGridProps {
  items: number[];
  selectedIndex: number;
  staticSelection?: boolean;
  scale: number;
  spritesBase: string;
  style?: CSSProperties;
}

export type { PauseItemGridProps };
