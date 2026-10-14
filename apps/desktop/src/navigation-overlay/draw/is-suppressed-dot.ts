/* @layer renderer-components @kind logic */
import { STAIRS_TRAVERSAL_STATE } from '@rotp/navigation';
import { DRAW_DOTS_LEDGE_ATTRS } from '@rotp/game-data';
import type { DotCellInput, DotCellState } from './dot-cell.type';
import { isLedgeReachState } from './is-ledge-reach-state';

const standingLayerAttrOf = (input: DotCellInput, state: DotCellState): number | undefined => {
  const { drawResult, perLayer, row, col } = input;
  return perLayer !== null && !state.layer0Reach
    ? drawResult.dualLayerGrids?.layer1[row]?.[col]
    : drawResult.attrGrid?.[row]?.[col];
};

const isSuppressedDot = (input: DotCellInput, state: DotCellState): boolean => {
  const attr = standingLayerAttrOf(input, state);
  if (!state.reachedOnBothLayers && attr !== undefined && DRAW_DOTS_LEDGE_ATTRS.has(attr)) return true;
  if (input.perLayer === null) return false;
  const { layer0State, layer1State } = state;
  if (layer0State === STAIRS_TRAVERSAL_STATE || layer1State === STAIRS_TRAVERSAL_STATE) return true;
  return isLedgeReachState(layer0State) || isLedgeReachState(layer1State);
};

export { isSuppressedDot };
