/* @layer renderer-components @kind types */
import type { PlayerSheet, Wearing } from '@shared/game/data/player-sheet/types';

interface SheetBrowserProps {
  sheet: PlayerSheet;
  wearing: Wearing;
  scale: number;
}

export type { SheetBrowserProps };
