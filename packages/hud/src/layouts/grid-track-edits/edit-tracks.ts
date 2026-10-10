/* @layer shared-hud @kind logic */
import type { Extent } from '../../types';
import type { TrackEdit } from './grid-track-edits.type';

const clampIndex = (index: number, length: number): number =>
  Math.min(Math.max(Math.trunc(index), 0), Math.max(0, length));

const removeTrack = (next: Extent[], index: number): Extent[] => {
  if (index < 0 || index >= next.length) return next;
  next.splice(index, 1);
  return next;
};

const moveTrack = (next: Extent[], from: number, to: number): Extent[] => {
  if (from < 0 || from >= next.length || to < 0 || to >= next.length) return next;
  const [moved] = next.splice(from, 1);
  if (moved !== undefined) next.splice(to, 0, moved);
  return next;
};

const editTracks = (tracks: readonly Extent[], edit: TrackEdit): Extent[] => {
  const next = [...tracks];
  switch (edit.op) {
    case 'append':
      next.push('auto');
      return next;
    case 'insert':
      next.splice(clampIndex(edit.index, next.length), 0, 'auto');
      return next;
    case 'remove':
      return removeTrack(next, edit.index);
    case 'move':
      return moveTrack(next, edit.from, edit.to);
    case 'size':
      return next.map((track, at) => (edit.indices.includes(at) ? edit.extent : track));
  }
};

export { editTracks };
