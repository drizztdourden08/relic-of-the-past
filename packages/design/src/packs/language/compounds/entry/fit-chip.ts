/* @layer renderer-components @kind logic */
import { ROW_WIDTH_PX } from '@rotp/languages';
import type { RowFit } from '@rotp/languages';
import { NEAR_LIMIT_RATIO, NOT_MEASURED } from './entry.constants';
import type { FitChip } from './entry.type';

const widest = (rows: RowFit[]): RowFit =>
  rows.reduce((worst, row) => (row.widthPx > worst.widthPx ? row : worst));

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
