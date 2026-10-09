/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives';
import { glyphIndexOf } from '@shared/game/language';
import { GlyphCell } from '../glyph';
import type { GlyphMetrics } from '@shared/game/language';
import { CURSOR_CHAR } from './preview.constants';
import type { ChoiceCursorProps } from './preview.type';

const cursorGlyph = (metrics: GlyphMetrics | null): number | null => {
  if (metrics === null) return null;
  const match = glyphIndexOf(CURSOR_CHAR, 0, metrics);
  return match !== null && match.length === CURSOR_CHAR.length ? match.index : null;
};

const ChoiceCursor = (props: ChoiceCursorProps) => {
  const { sheet, metrics } = props;
  const glyph = cursorGlyph(metrics);

  return (
    <Box as="span" className="preview-cursor" aria-hidden="true">
      {glyph !== null && sheet !== null
        ? <GlyphCell glyph={glyph} sheet={sheet} metrics={metrics} />
        : CURSOR_CHAR}
    </Box>
  );
};

export { ChoiceCursor };
