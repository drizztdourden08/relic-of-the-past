/* @layer renderer-components @kind component */
/**
 * One row of a previewed box: the glyphs the layout walk says are standing
 * there, each advanced by its own width out of the pack's table.
 *
 * A row that was already on screen before this box drew is dimmed, not
 * hidden. It IS on screen, because nothing clears it, so removing it would be
 * the lie. Showing it at full strength would suggest this box wrote it.
 */
import { Box } from '@ds/primitives';
import { GlyphCell } from '../../editor-ui';
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language';
import type { PreviewRow } from './preview-screens';

type GlyphRowProps = {
  row: PreviewRow;
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
};

const GlyphRow = (props: GlyphRowProps) => {
  const { row, sheet, metrics } = props;
  const className = `preview-row${row.carried ? ' preview-row--carried' : ''}`;

  return (
    <Box className={className} data-row={row.row}>
      {row.glyphs.map((glyph, at) => (
        <GlyphCell key={at} glyph={glyph} sheet={sheet} metrics={metrics} />
      ))}
    </Box>
  );
};

export { GlyphRow };
export type { GlyphRowProps };
