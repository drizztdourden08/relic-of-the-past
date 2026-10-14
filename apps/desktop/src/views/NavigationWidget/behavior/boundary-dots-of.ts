/* @layer renderer-widgets @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { BoundaryDot, ScrollBoundaries } from '../sub-components/IndoorMinimap.type';
import { horizontalBoundaryDots } from './horizontal-boundary-dots';
import { verticalBoundaryDots } from './vertical-boundary-dots';

const boundaryDotsOf = (primaryResult: FloodFillResult | undefined, scrollBoundaries: ScrollBoundaries): BoundaryDot[] => {
  if (!primaryResult) return [];
  return [
    ...(scrollBoundaries.horizontal ? horizontalBoundaryDots(primaryResult.reachable) : []),
    ...(scrollBoundaries.vertical ? verticalBoundaryDots(primaryResult.reachable) : []),
  ];
};

export { boundaryDotsOf };
