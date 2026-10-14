/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { crossingSpanLabel } from '../behavior/crossing-span-label';
import { crossingTilesLabel } from '../behavior/crossing-tiles-label';
import { fromLabelOf } from '../behavior/from-label-of';
import { EdgeArrowSvg } from './EdgeArrowSvg';
import type { EdgeCardHeaderProps } from './EdgeCard.type';

const EdgeCardHeader = ({ row, screenBundle }: EdgeCardHeaderProps) => {
  const { crossing, sourceScreen } = row;
  const span = crossingSpanLabel(crossing);
  const tiles = crossingTilesLabel(crossing.span);

  return (
    <Box className="nav-conn-header">
      <EdgeArrowSvg edge={crossing.side ?? 'east'} size={16} />
      <Text className="nav-conn-title">{crossing.label}{fromLabelOf(screenBundle, sourceScreen)}</Text>
      {!crossing.available && <Text className="nav-edge-card__blocked-tag">blocked</Text>}
      {span && <Text className="nav-edge-card__dim-badge">{span}</Text>}
      {tiles && <Text className="nav-edge-card__dim-badge">{tiles}</Text>}
    </Box>
  );
};

export { EdgeCardHeader };
