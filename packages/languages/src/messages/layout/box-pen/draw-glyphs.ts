/* @layer shared-game @kind logic */
import type { GlyphMetrics } from '../types';
import { widthOf } from '../glyph-metrics';
import type { Pen } from './box-pen.type';
import { slotAt } from './slot-at';

const drawGlyphs = (pen: Pen, glyphs: number[], metrics: GlyphMetrics): void => {
  const buf = slotAt(pen, pen.row);
  buf.drawn = true;
  pen.edits += 1;

  for (const index of glyphs) {
    buf.glyphs.push(index);
    buf.offsets.push(buf.widthPx);
    buf.widthPx += widthOf(index, metrics);
  }
};

export { drawGlyphs };
