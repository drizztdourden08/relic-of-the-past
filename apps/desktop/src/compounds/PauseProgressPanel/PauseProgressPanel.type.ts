/* @layer renderer-hud @kind types */
import type { CSSProperties } from 'react';

interface PauseProgressPanelProps {
  pendants: number;
  crystals: number;
  showCrystals: boolean;
  scale: number;
  spritesBase: string;
  style?: CSSProperties;
}

export type { PauseProgressPanelProps };
