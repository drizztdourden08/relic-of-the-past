/* @layer renderer-widgets @kind logic */
import type { ConnectionInfo } from '@rotp/game-core';
import { BADGE, EDGE_PAD, GAP, TILE_COUNT } from '../sub-components/OverworldMinimap.constants';
import type { OverworldPartProps } from '../sub-components/OverworldMinimap.type';
import type { EdgeBadgeBox } from '../sub-components/EdgeBadge.type';
import { positionSpan } from './position-span';
import { sourceSlotOf } from './source-slot-of';

const overworldEdgeBadge = (axis: 'horizontal' | 'vertical', part: OverworldPartProps, c: ConnectionInfo, cross: number): EdgeBadgeBox => {
  const { bundle, grid } = part;
  const slot = sourceSlotOf(bundle, c);
  const { first, last } = positionSpan(c.positions);
  const fraction = first / TILE_COUNT;
  const spanFraction = (last - first + 1) / TILE_COUNT;
  if (axis === 'horizontal') {
    const col = slot >= 0 ? slot % grid.cols : 0;
    const colStart = EDGE_PAD + col * (grid.cellW + GAP);
    return { top: cross, left: colStart + fraction * grid.cellW, width: Math.max(BADGE, spanFraction * grid.cellW), height: BADGE };
  }
  const row = slot >= 0 ? Math.floor(slot / grid.cols) : 0;
  const rowStart = EDGE_PAD + row * (grid.cellH + GAP);
  return { top: rowStart + fraction * grid.cellH, left: cross, width: BADGE, height: Math.max(BADGE, spanFraction * grid.cellH) };
};

export { overworldEdgeBadge };
