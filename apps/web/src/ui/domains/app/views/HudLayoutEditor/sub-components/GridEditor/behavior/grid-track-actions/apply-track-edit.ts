/* @layer renderer-components @kind logic */
import { editGridTracks } from '@shared/hud/layouts';
import type { HudGridContainer } from '@shared/types/hud';
import type { TrackEdit } from '@shared/hud/layouts';
import type { PatchGrid } from '../../GridEditor.type';

const applyTrackEdit = (container: HudGridContainer, patch: PatchGrid, edit: TrackEdit): void => {
  const next = editGridTracks(container, edit);
  patch(edit.axis === 'columns'
    ? { columns: next.columns, children: next.children }
    : { rows: next.rows, children: next.children });
};

export { applyTrackEdit };
