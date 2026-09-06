/* @layer renderer-components @kind logic */
/**
 * The one-chip verdict on how a whole entry fits its box.
 *
 * The engine never wraps or clamps a row. It draws straight past the interior
 * and over the row below, so this is a pass/fail statement, not a percentage.
 * Three states, and the two that are not "fine" say which row and by how much,
 * because that is the only part a translator can act on.
 *
 * Pure: measured rows in, words and a severity out. Shared by the closed row and
 * the metadata panel so the two can never disagree about a verdict.
 */
import { ROW_WIDTH_PX } from '@shared/game/language';
import type { RowFit } from '@shared/game/language';

/** A row reads as tight once it has used this fraction of the interior. */
const NEAR_LIMIT_RATIO = 0.9;

type FitChip = {
  /** 'fits', 'tight', or which row overflows and by how much. */
  label: string;
  variant: 'success' | 'warning' | 'danger';
  /** The numbers behind the word, for the chip's tooltip. */
  detail: string;
};

const NOT_MEASURED: FitChip = { label: '', variant: 'success', detail: '' };

const widest = (rows: RowFit[]): RowFit =>
  rows.reduce((worst, row) => (row.widthPx > worst.widthPx ? row : worst), rows[0]);

/** The verdict for one entry's rows, or an empty chip when nothing is measured. */
const fitChipOf = (rows: RowFit[]): FitChip => {
  if (rows.length === 0) return NOT_MEASURED;

  const worst = widest(rows);
  const detail = `${worst.widthPx} of ${ROW_WIDTH_PX}px on row ${worst.row}`;
  const over = rows.find((row) => row.overflow);

  if (over !== undefined) {
    return {
      label: `row ${over.row} over by ${over.widthPx - ROW_WIDTH_PX}px`,
      variant: 'danger',
      detail,
    };
  }
  if (worst.widthPx / ROW_WIDTH_PX >= NEAR_LIMIT_RATIO) {
    return { label: 'tight', variant: 'warning', detail };
  }
  return { label: 'fits', variant: 'success', detail };
};

export { fitChipOf };
export type { FitChip };
