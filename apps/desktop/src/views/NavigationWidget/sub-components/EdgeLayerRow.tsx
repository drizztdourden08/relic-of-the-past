/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { targetLayerOf } from '../behavior/target-layer-of';
import type { EdgeLayerRowProps } from './EdgeCard.type';

const EdgeLayerRow = ({ toggles, playerLayer }: EdgeLayerRowProps) => {
  const t = useT();
  const targetLayer = targetLayerOf(t, toggles, playerLayer);

  if (!toggles) return <Box className="nav-edge-card__layer-row nav-val-green">{t('views-navigation:edge.layer.same')}</Box>;

  return (
    <Box className="nav-edge-card__layer-row nav-val-info">
      <Icon name="arrow-up-down" inline /> {t('views-navigation:edge.layer.toggle')} {targetLayer && (
        <Text className="nav-edge-card__layer-target"><Icon name="arrow-right" inline /> {targetLayer}</Text>
      )}
    </Box>
  );
};

export { EdgeLayerRow };
