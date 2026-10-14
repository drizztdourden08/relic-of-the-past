/* @layer renderer-components @kind logic */
import type { DotCellInput, DotCellState } from './dot-cell.type';
import { RING_COLOR_ABOVE, RING_COLOR_BOTH, RING_COLOR_GROUND } from './draw.constants';

const ringColorFor = (input: DotCellInput, state: DotCellState): string => {
  if (state.reachedOnBothLayers) return RING_COLOR_BOTH;
  const isAbove = input.perLayer !== null ? state.layer0Reach : input.singleLayerIsAbove;
  return isAbove ? RING_COLOR_ABOVE : RING_COLOR_GROUND;
};

export { ringColorFor };
