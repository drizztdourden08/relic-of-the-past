/* @layer renderer-hud @kind types */
import type { DialogCell } from '@shared/game/dialog/dialog-frame.types';

interface GlyphRowProps {
  cells: DialogCell[];
  atlas: HTMLCanvasElement;
  highlightAtlases?: readonly (HTMLCanvasElement | null)[];
  unit: number;
  widthPx: number;
}

export type { GlyphRowProps };
