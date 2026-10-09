/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { ROWS_PER_BOX } from '@shared/game/language';
import { ChoiceCursor } from './ChoiceCursor';
import { GlyphRow } from './GlyphRow';
import { NO_ROWS } from './preview.constants';
import type { PreviewBoxProps, PreviewRow } from './preview.type';
import './PreviewBox.css';

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
