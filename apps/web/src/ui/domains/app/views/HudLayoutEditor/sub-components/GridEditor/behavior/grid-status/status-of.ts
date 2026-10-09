/* @layer renderer-components @kind logic */
import { boundsOf, originsIn } from '../../../GridLattice';
import { sizeOf } from '../size-of';
import { anchorName } from './anchor-name';
import type { StatusParams } from '../../GridEditor.type';

const holds = (ids: readonly string[]): string => (ids.length > 0 ? ` holds ${ids.join(', ')}` : ' is empty');

const statusOf = (params: StatusParams): string => {
  const { selection, occupants, columns, rows } = params;
  if (selection.kind === 'none') return `${columns} × ${rows} grid, nothing selected`;

  if (selection.kind === 'track') {
    const axis = selection.axis === 'columns' ? 'column' : 'row';
    const total = selection.axis === 'columns' ? columns : rows;
    const held = originsIn(occupants, selection.axis === 'columns'
      ? { c0: Math.min(...selection.indices) + 1, c1: Math.max(...selection.indices) + 1, r0: 1, r1: rows }
      : { c0: 1, c1: columns, r0: Math.min(...selection.indices) + 1, r1: Math.max(...selection.indices) + 1 });
    const name = selection.indices.length === 1
      ? `${axis} ${selection.indices[0] + 1} of ${total}`
      : `${selection.indices.length} ${selection.axis}`;
    return `${name}${holds(held.map((o) => o.id))}`;
  }

  const bounds = boundsOf(selection.cells);
  const held = originsIn(occupants, bounds).map((o) => o.id);
  if (selection.cells.length === 1) {
    return `column ${bounds.c0}, row ${bounds.r0}${
      anchorName(columns, rows, bounds.c0, bounds.r0)}${holds(held)}`;
  }
  return `${selection.cells.length} cells, ${sizeOf(bounds)}${holds(held)}`;
};

export { statusOf };
