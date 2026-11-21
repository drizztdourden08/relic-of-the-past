/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import type { PlayerRowProps } from './PlayerStatePanel.type';

const LayerRow = ({ playerDebug }: PlayerRowProps) => {
  const t = useT();
  if (playerDebug.playerLayer === null) return null;

  return (
    <DescRow id="Layer" label={t('views-navigation:desc.layer.label')} desc={t('views-navigation:desc.layer.text')}>
      <Text className="nav-val-info">
        {playerDebug.playerLayer === 0 ? t('views-navigation:layervalue.upper') : t('views-navigation:layervalue.lower')}
      </Text>
    </DescRow>
  );
};

export { LayerRow };
