/* @layer renderer-components @kind logic */
import { applyEdit } from './apply-edit';
import type { GridActionContext, TrackAxis } from '../../GridEditor.type';

const shiftRun = (ctx: GridActionContext, axis: TrackAxis, index: number, by: number) => (): void => {
  applyEdit(ctx, { op: 'move', axis, from: index, to: index + by });
  ctx.edits.setSelection({ kind: 'track', axis, indices: [index + by], anchor: index + by });
};

export { shiftRun };
