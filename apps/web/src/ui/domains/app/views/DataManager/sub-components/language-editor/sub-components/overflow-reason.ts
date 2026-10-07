/* @layer renderer-components @kind logic */
/**
 * Why a line cannot be saved, in terms a translator can act on.
 *
 * Naming the consequence matters here: "too long" sounds like it will be
 * trimmed or wrapped, and it will not. The engine writes straight past the
 * edge of the box and over the line below.
 */
import { ROW_WIDTH_PX } from '@shared/game/language/layout/types';
import type { RowFit } from '@shared/game/language/layout/types';

/** Empty when every row fits. */
const overflowReason = (rows: RowFit[]): string => {
  const over = rows.filter((row) => row.overflow).map((row) => row.row);
  if (over.length === 0) return '';

  const which = over.length === 1
    ? `Line ${over[0]} is`
    : `Lines ${over.slice(0, -1).join(', ')} and ${over[over.length - 1]} are`;

  return `${which} too long for the box. The game keeps writing past the edge instead of `
    + `wrapping, which paints over the line below, so this cannot be saved until it fits `
    + `within ${ROW_WIDTH_PX} pixels.`;
};

export { overflowReason };
