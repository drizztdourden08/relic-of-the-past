/* @layer renderer-hud @kind types */
import type { ItemCell } from '@shared/game/logic/pause';

interface PauseCellGridProps {
  cells: readonly ItemCell[];
  columns: number;
  cursor: number;
  showCursor: boolean;
  scale: number;
  spritesBase: string;
  onPick: (index: number) => void;
}

export type { PauseCellGridProps };
