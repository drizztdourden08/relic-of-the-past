/* @layer renderer-components @kind types */
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language';

type GlyphCellProps = {
  glyph: number;
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
};

type GlyphStore = {
  width: number;
  height: number;
};

type PaintJob = { canvas: HTMLCanvasElement; tiles: Uint8Array; glyph: number; ratio: number };

export type { GlyphCellProps, GlyphStore, PaintJob };
