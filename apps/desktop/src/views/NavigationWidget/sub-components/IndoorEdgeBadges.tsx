/* @layer renderer-widgets @kind component */
import { indoorHorizontalBadge } from '../behavior/indoor-horizontal-badge';
import { indoorVerticalBadge } from '../behavior/indoor-vertical-badge';
import { EdgeBadgeRows } from './EdgeBadgeRows';
import { INDOOR_EDGE_OFFSETS } from './IndoorEdgeBadges.constants';
import type { IndoorEdgeBadgesProps } from './IndoorMinimap.type';

const IndoorEdgeBadges = ({ byEdge }: IndoorEdgeBadgesProps) => (
  <EdgeBadgeRows byEdge={byEdge} offsets={INDOOR_EDGE_OFFSETS} horizontalBox={indoorHorizontalBadge} verticalBox={indoorVerticalBadge} />
);

export { IndoorEdgeBadges };
