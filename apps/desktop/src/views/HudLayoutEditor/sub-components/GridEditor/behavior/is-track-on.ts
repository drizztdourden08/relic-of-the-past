/* @layer renderer-components @kind logic */
import type { GridSelection, TrackAxis } from '../GridEditor.type';

const isTrackOn = (selection: GridSelection, axis: TrackAxis, index: number): boolean =>
  selection.kind === 'track' && selection.axis === axis && selection.indices.includes(index);

export { isTrackOn };
