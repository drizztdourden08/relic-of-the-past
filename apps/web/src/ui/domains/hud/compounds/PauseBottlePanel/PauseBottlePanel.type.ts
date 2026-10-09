/* @layer renderer-hud @kind types */
import type { CSSProperties } from 'react';

interface PauseBottlePanelProps {
  bottles: number[];
  selectedIndex: number;
  scale: number;
  spritesBase: string;
  style?: CSSProperties;
}

export type { PauseBottlePanelProps };
