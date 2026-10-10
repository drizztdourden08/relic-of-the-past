/* @layer renderer-components @kind logic */
import { ONE } from './grid-track-actions.constants';
import type { TrackAxis } from '../GridEditor.type';

const rangeLabel = (axis: TrackAxis, indices: readonly number[]): string => {
  const first = Math.min(...indices) + 1;
  const last = Math.max(...indices) + 1;
  return first === last ? `${ONE[axis]} ${first}` : `${axis} ${first}-${last}`;
};

export { rangeLabel };
