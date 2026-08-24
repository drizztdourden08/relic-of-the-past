/* @layer renderer-components @kind component */
/**
 * The text box itself: three rows, always three, at the interior's real width.
 *
 * The height is fixed because the box's is. A preview that shrank to fit one
 * line of text would hide the thing worth seeing — that the other two rows are
 * still carrying whatever an earlier box left there.
 *
 * Rows are placed by their own row number rather than in list order, so a box
 * that writes only row 2 draws it in the middle with the real gaps above and
 * below it.
 *
 * Two of the box's own behaviours ride along: a blinking wait marker while the
 * box is holding for a press, and — when `scrolled` — a brief upward shift of
 * the rows as they arrive, keyed on `scrollKey` so each advance replays it.
 * A choice prompt's selection cursor draws in column 0 of `cursorRow`.
 */
import { Box } from '@ds/primitives';
import { ROWS_PER_BOX } from '@shared/game/language';
import { ChoiceCursor } from './ChoiceCursor';
import { GlyphRow } from './GlyphRow';
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language';
import type { PreviewRow } from './preview-screens';
import './PreviewBox.css';

type PreviewBoxProps = {
  rows: PreviewRow[];
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
  /** 1-based row the selection cursor sits on; null hides it. */
  cursorRow?: number | null;
  /**
   * Every 1-based option row. The cursor frames repaint column 0 of ALL of
   * them each frame — the cursor on the selected row, a blank on the others —
   * so the blank covers whatever cursor glyph the stored text itself carries.
   */
  optionRows?: readonly number[];
  /** The box is holding for a press, so the wait marker blinks. */
  waiting?: boolean;
  /** This box arrived by advancing, so its rows shift up into place. */
  scrolled?: boolean;
  /** Changes with every advance, replaying the shift for each new box. */
  scrollKey?: number;
};

/** The box's three slots, each holding its row or nothing. */
const NO_ROWS: readonly number[] = [];

const slotsOf = (rows: PreviewRow[]): (PreviewRow | null)[] => Array.from(
  { length: ROWS_PER_BOX },
  (_, at) => rows.find((row) => row.row === at + 1) ?? null,
);

const PreviewBox = (props: PreviewBoxProps) => {
  const {
    rows, sheet, metrics, cursorRow = null, optionRows = NO_ROWS,
    waiting = false, scrolled = false, scrollKey = 0,
  } = props;
  const slots = slotsOf(rows);
  const rowsClass = `preview-box__rows${scrolled ? ' preview-box__rows--scrolled' : ''}`;

  return (
    <Box className="preview-box game-text">
      <Box key={scrollKey} className={rowsClass}>
        {slots.map((row, at) => (
          <Box key={at} className="preview-box__slot">
            {cursorRow === at + 1
              ? <ChoiceCursor sheet={sheet} metrics={metrics} />
              : optionRows.includes(at + 1)
                ? <Box as="span" className="preview-cursor preview-cursor--blank" aria-hidden="true" />
                : null}
            {row === null
              ? <Box className="preview-row preview-row--blank" />
              : <GlyphRow row={row} sheet={sheet} metrics={metrics} />}
          </Box>
        ))}
      </Box>
      {waiting
        ? <Box as="span" className="preview-box__wait" aria-hidden="true">▼</Box>
        : null}
    </Box>
  );
};

export { PreviewBox };
export type { PreviewBoxProps };
