/* @layer renderer-components @kind types */
import type { PlayerSheet, Wearing } from '@rotp/game-data';
import type { PoseLabelsProp } from '../../behavior/pose-labels';

interface SheetBrowserProps extends PoseLabelsProp {
  sheet: PlayerSheet;
  wearing: Wearing;
  scale: number;
}

export type { SheetBrowserProps };
