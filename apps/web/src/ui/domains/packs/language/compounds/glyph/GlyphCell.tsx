/* @layer renderer-components @kind component */
import { Box, Canvas } from '@ds/primitives';
import { widthOf } from '@shared/game/language';
import { CELL_W } from './glyph.constants';
import { useGlyphCanvas } from './behavior/useGlyphCanvas';
import type { CSSProperties } from 'react';
import type { GlyphMetrics } from '@shared/game/language';
import type { GlyphCellProps } from './glyph.type';
import './GlyphChar.css';

const advanceStyle = (glyph: number, metrics: GlyphMetrics | null): CSSProperties | undefined => {
  if (metrics === null) return undefined;
  const inkBoxes = Math.round((widthOf(glyph, metrics) / CELL_W) * 1000) / 1000;
  return { '--glyph-advance': `calc(var(--glyph-cell-w) * ${inkBoxes})` } as CSSProperties;
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
