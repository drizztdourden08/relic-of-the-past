/* @layer renderer-hud @kind types */
import type { ItemCell } from '@shared/game/logic/pause';

interface PauseCellGridProps {
  /** Cells in cursor order; an unowned one still carries its silhouette sprite. */
  cells: readonly ItemCell[];
  columns: number;
  /** Index of the cursor within `cells`. */
  cursor: number;
  /** False while the cursor lives in another section of the same screen. */
  showCursor: boolean;
  scale: number;
  spritesBase: string;
  /** Clicking a cell moves the cursor there; it never assigns on its own. */
  onPick: (index: number) => void;
}

export type { PauseCellGridProps };
