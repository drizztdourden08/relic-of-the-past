/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { DotCellState, PerLayerReach } from './dot-cell.type';

const dotCellState = (perLayer: PerLayerReach | null, drawResult: FloodFillResult, row: number, col: number): DotCellState => {
  if (perLayer === null) {
    return {
      layer0State: undefined, layer1State: undefined, layer0Reach: false, layer1Reach: false,
      mergedReachable: drawResult.reachable[row]?.[col] === 1, reachedOnBothLayers: false,
    };
  }
  const layer0State = perLayer[0][row]?.[col];
  const layer1State = perLayer[1][row]?.[col];
  const layer0Reach = layer0State !== 0;
  const layer1Reach = layer1State !== 0;
  return {
    layer0State, layer1State, layer0Reach, layer1Reach,
    mergedReachable: layer0Reach || layer1Reach, reachedOnBothLayers: layer0Reach && layer1Reach,
  };
};

export { dotCellState };
