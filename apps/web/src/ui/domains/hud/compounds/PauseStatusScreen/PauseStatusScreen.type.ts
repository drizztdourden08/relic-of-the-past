/* @layer renderer-hud @kind types */
import type { HeartMode } from '../../primitives/HudHeart';

type PauseAction = 'continue' | 'save-quit';

interface DungeonItemCell {
  sprite: string;
  owned: boolean;
}

interface PauseStatusScreenProps {
  healthCurrent: number;
  healthCapacity: number;
  heartMode: HeartMode;
  armor?: number;
  heartPieces: number;
  magic: number;
  halfMagic: boolean;
  pendants: number;
  crystals: number;
  dungeonItems: readonly DungeonItemCell[];
  cursor: number;
  scale: number;
  spritesBase: string;
  onFocusAction: (cursor: number) => void;
  onConfirm: () => void;
}

export type { DungeonItemCell, PauseAction, PauseStatusScreenProps };
