/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { GlyphCell } from '../glyph';
import type { GlyphRowProps } from './preview.type';

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
