/* @layer renderer-hud @kind types */
import type { DialogCell } from '@shared/game/dialog/dialog-frame.types';

interface TypefaceRowProps {
  cells: DialogCell[];
  alphabet: readonly string[];
  atlas: HTMLCanvasElement | null;
  unit: number;
  ink: string;
  highlightInks?: readonly string[];
  stroke: string;
  strokeWidth: number;
}

export type { TypefaceRowProps };
