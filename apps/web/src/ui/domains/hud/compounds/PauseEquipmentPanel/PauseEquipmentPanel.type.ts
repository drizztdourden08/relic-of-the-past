/* @layer renderer-hud @kind types */
import type { CSSProperties } from 'react';

interface PauseEquipmentPanelProps {
  sword: number;
  shield: number;
  armor: number;
  heartPieces: number;
  isInDungeon: boolean;
  bigKeys: number;
  maps: number;
  compasses: number;
  palaceIndex: number;
  scale: number;
  spritesBase: string;
  style?: CSSProperties;
}

export type { PauseEquipmentPanelProps };
