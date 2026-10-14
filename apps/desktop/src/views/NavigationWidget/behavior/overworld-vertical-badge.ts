/* @layer renderer-widgets @kind logic */
import type { ConnectionInfo } from '@rotp/game-core';
import type { ScreenBundleGrid } from '@rotp/game-data';
import { BADGE, EDGE_PAD, GAP, TILE_COUNT } from '../sub-components/OverworldMinimap.constants';
import type { OverworldGrid } from '../sub-components/OverworldMinimap.type';
import type { EdgeBadgeBox } from '../sub-components/EdgeBadge.type';
import { positionSpan } from './position-span';
import { sourceSlotOf } from './source-slot-of';

const overworldVerticalBadge = (bundle: ScreenBundleGrid, grid: OverworldGrid, c: ConnectionInfo, left: number): EdgeBadgeBox => {
  const slot = sourceSlotOf(bundle, c);
  const row = slot >= 0 ? Math.floor(slot / grid.cols) : 0;
  const rowStart = EDGE_PAD + row * (grid.cellH + GAP);
  const { first, last } = positionSpan(c.positions);
  return {
    top: rowStart + (first / TILE_COUNT) * grid.cellH,
    left,
    width: BADGE,
    height: Math.max(BADGE, ((last - first + 1) / TILE_COUNT) * grid.cellH),
  };
};

export { overworldVerticalBadge };
