/* @layer renderer-widgets @kind logic */
import type { RoomLayoutInfo } from '../../../game';
import type { ScrollBoundaries } from '../sub-components/IndoorMinimap.type';

const scrollBoundariesOf = (layoutInfo: RoomLayoutInfo | null): ScrollBoundaries => {
  if (!layoutInfo) return { horizontal: false, vertical: false };
  const { shape, quadrantFullsizeX, quadrantFullsizeY } = layoutInfo;
  return {
    horizontal: (shape === '2x2' || shape === '1x2') && quadrantFullsizeY === 0,
    vertical: (shape === '2x2' || shape === '2x1') && quadrantFullsizeX === 0,
  };
};

export { scrollBoundariesOf };
