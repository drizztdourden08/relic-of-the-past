/* @layer renderer-hud @kind types */
import type { DialogCell } from '@rotp/game-data';

interface DialogHighlight {
  atlases: readonly (HTMLCanvasElement | null)[];
  inks: readonly string[];
}

interface DialogRowsProps {
  rows: DialogCell[][];
  unit: number;
  widthPx: number;
  visibleRows: number;
  scrollStep: number;
  font: 'original' | 'modern';
  atlas: HTMLCanvasElement | null;
  highlight: DialogHighlight;
  alphabet: readonly string[];
  ink: string;
  stroke: string;
  strokeWidth: number;
  itemSprite: string | null;
}

export type { DialogHighlight, DialogRowsProps };
