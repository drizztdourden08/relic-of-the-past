/* @layer shared-hud @kind logic */
import type { Extent } from '../../../types/hud';
import type { TrackEdit } from './grid-track-edits.type';

const clampIndex = (index: number, length: number): number =>
  Math.min(Math.max(Math.trunc(index), 0), Math.max(0, length));

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
      if (edit.index < 0 || edit.index >= next.length) return next;
      next.splice(edit.index, 1);
      return next;
    case 'move': {
      if (edit.from < 0 || edit.from >= next.length || edit.to < 0 || edit.to >= next.length) return next;
      const [moved] = next.splice(edit.from, 1);
      next.splice(edit.to, 0, moved);
      return next;
    }
    default:
      return next.map((track, at) => (edit.indices.includes(at) ? edit.extent : track));
  }
};

export { editTracks };
