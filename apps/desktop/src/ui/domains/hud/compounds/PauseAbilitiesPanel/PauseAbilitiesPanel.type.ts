/* @layer renderer-hud @kind types */
import type { CSSProperties } from 'react';

interface PauseAbilitiesPanelProps {
  gloves: number;
  boots: number;
  flippers: number;
  moonPearl: number;
  abilityFlags: number;
  scale: number;
  spritesBase: string;
  style?: CSSProperties;
}

export type { PauseAbilitiesPanelProps };
