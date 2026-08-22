/* @layer renderer-components @kind component */
/**
 * The key to the symbols in the line being edited, shown under the editor while
 * it has focus.
 *
 * It lists only what this line ACTUALLY uses. A fixed legend of everything would
 * be a manual; a legend of the four symbols in front of you is a reminder, and
 * it shrinks to nothing on a line of plain text.
 *
 * It FLOATS: absolutely positioned under the card, so appearing and disappearing
 * as focus comes and goes never reflows what follows. It is inert to the pointer
 * except for reading — `aria-hidden` while closed, no tab stops, no focus taken —
 * so it cannot be the thing that dismisses itself.
 */
import { Box, Text } from '@ds/primitives';
import { ROWS_PER_BOX, ROW_WIDTH_PX } from '@shared/game/language';
import { LegendRow } from './LegendRow';
import type { GlyphFont, LegendEntry } from './editor-ui.type';
import './EditorLegend.css';

type EditorLegendProps = {
  entries: LegendEntry[];
  open: boolean;
  font: GlyphFont;
};

/**
 * The one constraint that bites in practice. The engine advances the pen by each
 * glyph's own width and never checks the row bound, so an over-long row writes
 * over the row below instead of wrapping — worth a standing reminder rather than
 * only an after-the-fact error.
 */
const BOX_LIMIT = `The box holds ${ROWS_PER_BOX} rows of ${ROW_WIDTH_PX}px each — a row that runs past the edge paints over the one below it.`;

const EditorLegend = (props: EditorLegendProps) => {
  const { entries, open, font } = props;

  return (
    <Box
      className={`editor-legend${open ? ' editor-legend--open' : ''}`}
      role="note"
      aria-label="What the symbols in this line mean"
      aria-hidden={open ? undefined : true}
    >
      {entries.length > 0 ? (
        <Box className="editor-legend__list">
          {entries.map((entry) => (
            <LegendRow font={font} key={entry.id} entry={entry} />
          ))}
        </Box>
      ) : null}
      <Text className="editor-legend__limit" variant="caption">{BOX_LIMIT}</Text>
    </Box>
  );
};

export { EditorLegend };
export type { EditorLegendProps };
