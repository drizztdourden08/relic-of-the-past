/* @layer renderer-components @kind logic */
import { editGridTracks } from '@rotp/hud';
import type { GridActionContext, TrackAxis } from '../GridEditor.type';

const removeRun = (ctx: GridActionContext, axis: TrackAxis, indices: readonly number[]) => (): void => {
  if (axis === 'columns' && ctx.container.columns.length - indices.length < 1) {
    ctx.edits.refuse('A grid needs at least one column.');
    return;
  }
  let next = ctx.container;
  for (const index of [...indices].sort((a, b) => b - a)) {
    next = editGridTracks(next, { op: 'remove', axis, index });
  }
  ctx.edits.patchContainer(axis === 'columns'
    ? { columns: next.columns, children: next.children }
    : { rows: next.rows, children: next.children });
  ctx.edits.setSelection({ kind: 'none' });
};

export { removeRun };
