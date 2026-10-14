/* @layer renderer-widgets @kind logic */
import type { ConnectionInfo } from '@rotp/game-core';
import type { ScreenBundleGrid } from '@rotp/game-data';
import { BADGE, EDGE_PAD, GAP, TILE_COUNT } from '../sub-components/OverworldMinimap.constants';
import type { OverworldGrid } from '../sub-components/OverworldMinimap.type';
import type { EdgeBadgeBox } from '../sub-components/EdgeBadge.type';
import { positionSpan } from './position-span';
import { sourceSlotOf } from './source-slot-of';

const overworldHorizontalBadge = (bundle: ScreenBundleGrid, grid: OverworldGrid, c: ConnectionInfo, top: number): EdgeBadgeBox => {
  const slot = sourceSlotOf(bundle, c);
  const col = slot >= 0 ? slot % grid.cols : 0;
  const colStart = EDGE_PAD + col * (grid.cellW + GAP);
  const { first, last } = positionSpan(c.positions);
  return {
    top,
    left: colStart + (first / TILE_COUNT) * grid.cellW,
    width: Math.max(BADGE, ((last - first + 1) / TILE_COUNT) * grid.cellW),
    height: BADGE,
  };
};

export { overworldHorizontalBadge };
