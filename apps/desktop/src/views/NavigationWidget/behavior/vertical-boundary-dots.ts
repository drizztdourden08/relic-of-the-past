/* @layer renderer-widgets @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import { EDGE_COLOR_BY_SIDE as EDGE_COLORS } from '../NavigationWidget.constants';
import { MAP_LEFT, MAP_SIZE, MAP_TOP, SCROLL_SEAM, TILE_COUNT } from '../sub-components/IndoorMinimap.constants';
import type { BoundaryDot } from '../sub-components/IndoorMinimap.type';

const verticalBoundaryDots = (reachable: FloodFillResult['reachable']): BoundaryDot[] => {
  const dots: BoundaryDot[] = [];
  for (let row = 0; row < TILE_COUNT; row++) {
    const cells = reachable[row];
    if (!cells?.[SCROLL_SEAM] || !cells[SCROLL_SEAM + 1]) continue;
    const y = MAP_TOP + ((row + 0.5) / TILE_COUNT) * MAP_SIZE;
    dots.push({ x: MAP_LEFT + ((SCROLL_SEAM + 0.5) / TILE_COUNT) * MAP_SIZE, y, color: EDGE_COLORS.east });
    dots.push({ x: MAP_LEFT + ((SCROLL_SEAM + 1.5) / TILE_COUNT) * MAP_SIZE, y, color: EDGE_COLORS.west });
  }
  return dots;
};

export { verticalBoundaryDots };
