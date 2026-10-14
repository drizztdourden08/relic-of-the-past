/* @layer renderer-widgets @kind component */
import type { ConnectionInfo } from '@rotp/game-core';
import { badgeTitle } from '../behavior/badge-title';
import { indoorHorizontalBadge } from '../behavior/indoor-horizontal-badge';
import { indoorVerticalBadge } from '../behavior/indoor-vertical-badge';
import { EdgeBadge } from './EdgeBadge';
import { BADGE, BORDER_W, FRAME_LEFT, FRAME_TOP, MAP_SIZE } from './IndoorMinimap.constants';
import type { IndoorEdgeBadgesProps } from './IndoorMinimap.type';

const IndoorEdgeBadges = ({ byEdge }: IndoorEdgeBadgesProps) => {
  const horizontal = (list: ConnectionInfo[], prefix: string, top: number) => list.map((c, i) => (
    <EdgeBadge key={`${prefix}${i}`} connection={c} box={indoorHorizontalBadge(c, top)} title={badgeTitle(c, 'c')} />
  ));
  const vertical = (list: ConnectionInfo[], prefix: string, left: number) => list.map((c, i) => (
    <EdgeBadge key={`${prefix}${i}`} connection={c} box={indoorVerticalBadge(c, left)} title={badgeTitle(c, 'r')} />
  ));

  return (
    <>
      {horizontal(byEdge.north, 'n', FRAME_TOP - BADGE + BORDER_W)}
      {horizontal(byEdge.south, 's', FRAME_TOP + MAP_SIZE + BORDER_W)}
      {vertical(byEdge.west, 'w', FRAME_LEFT - BADGE + BORDER_W)}
      {vertical(byEdge.east, 'e', FRAME_LEFT + MAP_SIZE + BORDER_W)}
    </>
  );
};

export { IndoorEdgeBadges };
