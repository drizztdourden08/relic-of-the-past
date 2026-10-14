/* @layer renderer-widgets @kind logic */
import type { ConnectionInfo } from '@rotp/game-core';
import { BADGE, MAP_LEFT, MAP_SIZE, TILE_COUNT } from '../sub-components/IndoorMinimap.constants';
import type { EdgeBadgeBox } from '../sub-components/EdgeBadge.type';
import { positionSpan } from './position-span';

const indoorHorizontalBadge = (c: ConnectionInfo, top: number): EdgeBadgeBox => {
  const { first, last } = positionSpan(c.positions);
  const spanW = Math.max(BADGE, ((last - first + 1) / TILE_COUNT) * MAP_SIZE);
  const midX = MAP_LEFT + ((first + last + 1) / 2 / TILE_COUNT) * MAP_SIZE;
  return { top, left: Math.round(midX - spanW / 2), width: spanW, height: BADGE };
};

export { indoorHorizontalBadge };
