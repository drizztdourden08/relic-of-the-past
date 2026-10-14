/* @layer renderer-components @kind logic */
import { isTrackOn } from './is-track-on';
import type { GridSelection, TrackAxis } from '../GridEditor.type';

const sizeIndices = (selection: GridSelection, axis: TrackAxis, index: number): readonly number[] =>
  (selection.kind === 'track' && isTrackOn(selection, axis, index) ? selection.indices : [index]);

export { sizeIndices };
