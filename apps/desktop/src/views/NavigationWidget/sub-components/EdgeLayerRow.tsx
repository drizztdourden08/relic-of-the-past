/* @layer renderer-widgets @kind component */
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { targetLayerOf } from '../behavior/target-layer-of';
import type { EdgeLayerRowProps } from './EdgeCard.type';

const EdgeLayerRow = ({ toggles, playerLayer }: EdgeLayerRowProps) => {
  const targetLayer = targetLayerOf(toggles, playerLayer);

  if (!toggles) return <Box className="nav-edge-card__layer-row nav-val-green">= No Layer Change</Box>;

  return (
    <Box className="nav-edge-card__layer-row nav-val-info">
      <Icon name="arrow-up-down" inline /> Layer Toggle {targetLayer && (
        <Text className="nav-edge-card__layer-target"><Icon name="arrow-right" inline /> {targetLayer}</Text>
      )}
    </Box>
  );
};

export { EdgeLayerRow };
