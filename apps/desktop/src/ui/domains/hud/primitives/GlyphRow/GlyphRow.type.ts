/* @layer renderer-hud @kind types */
import type { DialogCell } from '@rotp/game-data';

interface GlyphRowProps {
  cells: DialogCell[];
  atlas: HTMLCanvasElement;
  highlightAtlases?: readonly (HTMLCanvasElement | null)[];
  unit: number;
  widthPx: number;
}

export type { GlyphRowProps };
