/* @layer renderer-components @kind types */
import type { PlayerSheet, Wearing } from '@rotp/game-data';

interface SheetBrowserProps {
  sheet: PlayerSheet;
  wearing: Wearing;
  scale: number;
}

export type { SheetBrowserProps };
