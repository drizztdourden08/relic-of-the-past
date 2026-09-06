/* @layer renderer-components @kind component */
/**
 * One character of the pack's font, addressed by its INDEX, not by name.
 *
 * `GlyphChar` is the same cell reached the way an editor reaches it, starting
 * from the bracketed name in a line, which has to be matched against the
 * alphabet first. A laid-out row has already been through that: the layout walk
 * hands back glyph indices, one per drawn character, so a faithful box needs the
 * half of the job that starts where the name lookup ended.
 *
 * Both share the painter (`useGlyphCanvas`) and the stylesheet, so there is one
 * renderer of the game's pixels and one definition of a cell. The only thing
 * this adds is the advance: each cell is exactly as wide as the pack's width
 * table says, which is what makes a row of them as long on screen as it will be
 * in the box.
 */
import { Box, Canvas } from '@ds/primitives';
import { widthOf } from '@shared/game/language';
import { CELL_W } from './glyph-cell-geometry';
import { useGlyphCanvas } from './behavior/useGlyphCanvas';
import type { CSSProperties } from 'react';
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language';
import './GlyphChar.css';

type GlyphCellProps = {
  /** Index into the pack's alphabet, as the layout walk reports it. */
  glyph: number;
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
};

/**
 * The advance as a MULTIPLE of one ink box, so the caller's chosen cell size
 * still decides how big the character is drawn (see `GlyphChar`).
 */
const advanceStyle = (glyph: number, metrics: GlyphMetrics | null): CSSProperties | undefined => {
  if (metrics === null) return undefined;
  const boxes = Math.round((widthOf(glyph, metrics) / CELL_W) * 1000) / 1000;
  return { '--glyph-advance': `calc(var(--glyph-cell-w) * ${boxes})` } as CSSProperties;
};

const GlyphCell = (props: GlyphCellProps) => {
  const { glyph, sheet, metrics } = props;
  const ref = useGlyphCanvas(sheet?.tiles ?? null, glyph);

  return (
    <Box as="span" className="glyph-char" style={advanceStyle(glyph, metrics)} aria-hidden="true">
      <Canvas ref={ref} className="glyph-char__ink" />
    </Box>
  );
};

export { GlyphCell };
export type { GlyphCellProps };
