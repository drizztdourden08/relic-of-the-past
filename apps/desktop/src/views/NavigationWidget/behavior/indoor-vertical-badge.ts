/* @layer renderer-widgets @kind logic */
import type { ConnectionInfo } from '@rotp/game-core';
import { BADGE, MAP_SIZE, MAP_TOP, TILE_COUNT } from '../sub-components/IndoorMinimap.constants';
import type { EdgeBadgeBox } from '../sub-components/EdgeBadge.type';
import { positionSpan } from './position-span';

const indoorVerticalBadge = (c: ConnectionInfo, left: number): EdgeBadgeBox => {
  const { first, last } = positionSpan(c.positions);
  const spanH = Math.max(BADGE, ((last - first + 1) / TILE_COUNT) * MAP_SIZE);
  const midY = MAP_TOP + ((first + last + 1) / 2 / TILE_COUNT) * MAP_SIZE;
  return { top: Math.round(midY - spanH / 2) - 1, left, width: BADGE, height: spanH };
};

export { indoorVerticalBadge };
