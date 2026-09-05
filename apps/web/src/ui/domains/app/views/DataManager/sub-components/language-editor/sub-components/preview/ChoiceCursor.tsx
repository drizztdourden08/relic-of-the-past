/* @layer renderer-components @kind component */
/**
 * The selection cursor on one option row: the pack's own `>` character, drawn
 * in the first cell, which is the column the game's cursor frames reserve for it.
 *
 * The glyph comes from the same matcher and painter every previewed character
 * goes through, so the cursor is the exact pixels the cursor frames draw. Only
 * when the pack's font is not readable yet does a plain `>` in the game face
 * stand in, so the row still shows which option is selected.
 */
import { Box } from '@ds/primitives';
import { glyphIndexOf } from '@shared/game/language';
import { GlyphCell } from '../../editor-ui';
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language';

const CURSOR_CHAR = '>';

/** The alphabet's index for the cursor character, or null without a font. */
const cursorGlyph = (metrics: GlyphMetrics | null): number | null => {
  if (metrics === null) return null;
  const match = glyphIndexOf(CURSOR_CHAR, 0, metrics);
  return match !== null && match.length === CURSOR_CHAR.length ? match.index : null;
};

type ChoiceCursorProps = {
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
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
export type { ChoiceCursorProps };
