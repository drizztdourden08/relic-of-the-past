/* @layer renderer-widgets @kind component */
import type { ConnectionInfo } from '@rotp/game-core';
import { badgeTitle } from '../behavior/badge-title';
import { overworldHorizontalBadge } from '../behavior/overworld-horizontal-badge';
import { overworldVerticalBadge } from '../behavior/overworld-vertical-badge';
import { EdgeBadge } from './EdgeBadge';
import { EDGE_PAD } from './OverworldMinimap.constants';
import type { OverworldEdgeBadgesProps } from './OverworldMinimap.type';

const OverworldEdgeBadges = ({ bundle, grid, byEdge }: OverworldEdgeBadgesProps) => {
  const horizontal = (list: ConnectionInfo[], prefix: string, top: number) => list.map((c, i) => (
    <EdgeBadge key={`${prefix}${i}`} connection={c} box={overworldHorizontalBadge(bundle, grid, c, top)} title={badgeTitle(c, 'c')} />
  ));
  const vertical = (list: ConnectionInfo[], prefix: string, left: number) => list.map((c, i) => (
    <EdgeBadge key={`${prefix}${i}`} connection={c} box={overworldVerticalBadge(bundle, grid, c, left)} title={badgeTitle(c, 'r')} />
  ));

  return (
    <>
      {horizontal(byEdge.north, 'n', EDGE_PAD - 15)}
      {horizontal(byEdge.south, 's', EDGE_PAD + grid.gridH + 1)}
      {vertical(byEdge.west, 'w', EDGE_PAD - 15)}
      {vertical(byEdge.east, 'e', EDGE_PAD + grid.gridW + 1)}
    </>
  );
};

export { OverworldEdgeBadges };
