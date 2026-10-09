/* @layer shared-hud @kind logic */
import { childAfter } from './child-after';
import { editTracks } from './edit-tracks';
import { tracksOn } from './tracks-on';
import type { HudGridContainer } from '../../../types/hud';
import type { TrackEdit } from './grid-track-edits.type';

const editGridTracks = (container: HudGridContainer, edit: TrackEdit): HudGridContainer => {
  const tracks = tracksOn(container, edit.axis);
  if (edit.op === 'remove' && edit.axis === 'columns' && tracks.length <= 1) return container;
  const next = editTracks(tracks, edit);
  const count = Math.max(1, next.length);
  const addressesUnchanged = edit.op === 'append' || edit.op === 'size';
  const children = addressesUnchanged
    ? container.children
    : container.children.map((child) => childAfter(child, edit, count));
  return edit.axis === 'columns'
    ? { ...container, columns: next, children }
    : { ...container, rows: next.length > 0 ? next : undefined, children };
};

export { editGridTracks };
