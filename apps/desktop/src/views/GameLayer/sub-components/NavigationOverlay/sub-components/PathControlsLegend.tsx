/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { CollapsiblePanel } from './CollapsiblePanel';

const PathControlsLegend = () => {
  const t = useT();
  return (
    <CollapsiblePanel title={t('views-game-layer:legend.controls.title')}>
      <Text className="nav-legend__dim">{t('views-game-layer:legend.controls.hold')}</Text>
      <Text className="nav-legend__dim">{t('views-game-layer:legend.controls.lock')}</Text>
      <Text className="nav-legend__dim">{t('views-game-layer:legend.controls.release')}</Text>
      <Text className="nav-legend__gold">{t('views-game-layer:legend.controls.copy')}</Text>
    </CollapsiblePanel>
  );
};

export { PathControlsLegend };
