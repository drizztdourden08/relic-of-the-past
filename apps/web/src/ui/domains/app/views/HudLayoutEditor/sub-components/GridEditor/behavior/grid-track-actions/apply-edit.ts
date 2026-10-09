/* @layer renderer-components @kind logic */
import { applyTrackEdit } from './apply-track-edit';
import type { TrackEdit } from '@shared/hud/layouts';
import type { GridActionContext } from '../../GridEditor.type';

const applyEdit = (ctx: GridActionContext, edit: TrackEdit): void =>
  applyTrackEdit(ctx.container, ctx.edits.patchContainer, edit);

export { applyEdit };
