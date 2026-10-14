/* @layer renderer-widgets @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import { EDGE_COLOR_BY_SIDE as EDGE_COLORS } from '../NavigationWidget.constants';
import { MAP_LEFT, MAP_SIZE, MAP_TOP, SCROLL_SEAM, TILE_COUNT } from '../sub-components/IndoorMinimap.constants';
import type { BoundaryDot } from '../sub-components/IndoorMinimap.type';

const horizontalBoundaryDots = (reachable: FloodFillResult['reachable']): BoundaryDot[] => {
  const dots: BoundaryDot[] = [];
  const upper = reachable[SCROLL_SEAM];
  const lower = reachable[SCROLL_SEAM + 1];
  for (let col = 0; col < TILE_COUNT; col++) {
    if (!upper?.[col] || !lower?.[col]) continue;
    const x = MAP_LEFT + ((col + 0.5) / TILE_COUNT) * MAP_SIZE;
    dots.push({ x, y: MAP_TOP + ((SCROLL_SEAM + 0.5) / TILE_COUNT) * MAP_SIZE, color: EDGE_COLORS.south });
    dots.push({ x, y: MAP_TOP + ((SCROLL_SEAM + 1.5) / TILE_COUNT) * MAP_SIZE, color: EDGE_COLORS.north });
  }
  return dots;
};

export { horizontalBoundaryDots };
