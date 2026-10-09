/* @layer renderer-components @kind logic */
import { applyEdit } from './apply-edit';
import type { GridActionContext, TrackAxis } from '../../GridEditor.type';

const insertRun = (ctx: GridActionContext, axis: TrackAxis, index: number) => (): void =>
  applyEdit(ctx, { op: 'insert', axis, index });

export { insertRun };
