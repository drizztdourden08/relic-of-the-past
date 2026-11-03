/* @layer renderer-widgets @kind component */
import { overworldEdgeBadge } from '../behavior/overworld-edge-badge';
import { EdgeBadgeRows } from './EdgeBadgeRows';
import { EDGE_PAD } from './OverworldMinimap.constants';
import type { OverworldEdgeBadgesProps } from './OverworldMinimap.type';

const OverworldEdgeBadges = ({ bundle, grid, byEdge }: OverworldEdgeBadgesProps) => {
  const offsets = {
    north: EDGE_PAD - 15,
    south: EDGE_PAD + grid.gridH + 1,
    west: EDGE_PAD - 15,
    east: EDGE_PAD + grid.gridW + 1,
  };

  return (
    <EdgeBadgeRows
      byEdge={byEdge}
      offsets={offsets}
      horizontalBox={(c, top) => overworldEdgeBadge('horizontal', { bundle, grid }, c, top)}
      verticalBox={(c, left) => overworldEdgeBadge('vertical', { bundle, grid }, c, left)}
    />
  );
};

export { OverworldEdgeBadges };
