/* @layer renderer-components @kind logic */
import { boundsOf, originsIn } from '../../GridLattice';
import { sizeOf } from './size-of';
import { anchorName } from './anchor-name';
import type { StatusParams } from '../GridEditor.type';

const trackName = (params: StatusParams, indices: readonly number[], isColumns: boolean): string => {
  const { t, columns, rows } = params;
  const total = isColumns ? columns : rows;
  const [only] = indices;
  if (indices.length === 1 && only !== undefined) {
    return isColumns
      ? t('hud-editor:grid.status.column-of', { n: only + 1, total })
      : t('hud-editor:grid.status.row-of', { n: only + 1, total });
  }
  return isColumns
    ? t('hud-editor:grid.chip.columns', { count: indices.length })
    : t('hud-editor:grid.chip.rows', { count: indices.length });
};

const statusOf = (params: StatusParams): string => {
  const { t, selection, occupants, columns, rows } = params;
  if (selection.kind === 'none') return t('hud-editor:grid.status.none', { columns, rows });

  if (selection.kind === 'track') {
    const isColumns = selection.axis === 'columns';
    const held = originsIn(occupants, isColumns
      ? { c0: Math.min(...selection.indices) + 1, c1: Math.max(...selection.indices) + 1, r0: 1, r1: rows }
      : { c0: 1, c1: columns, r0: Math.min(...selection.indices) + 1, r1: Math.max(...selection.indices) + 1 });
    const name = trackName(params, selection.indices, isColumns);
    return held.length > 0
      ? t('hud-editor:grid.status.track.holds', { name, ids: held.map((o) => o.id).join(', ') })
      : t('hud-editor:grid.status.track.empty', { name });
  }

  const bounds = boundsOf(selection.cells);
  const held = originsIn(occupants, bounds).map((o) => o.id);
  const ids = held.join(', ');
  if (selection.cells.length === 1) {
    const anchor = anchorName(t, { columns, rows }, bounds.c0, bounds.r0);
    return held.length > 0
      ? t('hud-editor:grid.status.cell.holds', { column: bounds.c0, row: bounds.r0, anchor, ids })
      : t('hud-editor:grid.status.cell.empty', { column: bounds.c0, row: bounds.r0, anchor });
  }
  const count = selection.cells.length;
  const size = sizeOf(bounds);
  return held.length > 0
    ? t('hud-editor:grid.status.cells.holds', { count, size, ids })
    : t('hud-editor:grid.status.cells.empty', { count, size });
};

export { statusOf };
