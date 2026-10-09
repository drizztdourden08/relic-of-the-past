/* @layer renderer-components @kind logic */
import { boundsOf } from '../../GridLattice';
import { GRID_ICONS } from './grid-icons';
import { insertRun } from './grid-track-actions';
import type { GridAction, GridActionContext } from '../GridEditor.type';

const cellActions = (ctx: GridActionContext): GridAction[] => {
  if (ctx.selection.kind !== 'cells') return [];
  const bounds = boundsOf(ctx.selection.cells);
  return [
    {
      key: 'insert-column-before', kind: 'button', icon: GRID_ICONS.insertColumnBefore, group: 'columns',
      label: `Insert a column before ${bounds.c0}`, run: insertRun(ctx, 'columns', bounds.c0 - 1),
    },
    {
      key: 'insert-column-after', kind: 'button', icon: GRID_ICONS.insertColumnAfter, group: 'columns',
      label: `Insert a column after ${bounds.c1}`, run: insertRun(ctx, 'columns', bounds.c1),
    },
    {
      key: 'insert-row-before', kind: 'button', icon: GRID_ICONS.insertRowBefore, group: 'rows',
      label: `Insert a row before ${bounds.r0}`, run: insertRun(ctx, 'rows', bounds.r0 - 1),
    },
    {
      key: 'insert-row-after', kind: 'button', icon: GRID_ICONS.insertRowAfter, group: 'rows',
      label: `Insert a row after ${bounds.r1}`, run: insertRun(ctx, 'rows', bounds.r1),
    },
  ];
};

export { cellActions };
