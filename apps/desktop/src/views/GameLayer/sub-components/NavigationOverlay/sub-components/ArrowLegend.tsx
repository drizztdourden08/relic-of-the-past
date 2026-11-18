/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { CollapsiblePanel } from './CollapsiblePanel';

const ArrowLegend = () => {
  const t = useT();
  return (
    <CollapsiblePanel title={t('views-game-layer:legend.arrows.title')}>
      <Box className="nav-legend__row"><Text className="nav-legend__cliff"><Icon name="arrow-right" /></Text><Text className="nav-legend__dim">{t('views-game-layer:legend.arrows.cliff')}</Text></Box>
      <Box className="nav-legend__row"><Text className="nav-legend__stairs"><Icon name="arrow-right" /></Text><Text className="nav-legend__dim">{t('views-game-layer:legend.arrows.stairs')}</Text></Box>
    </CollapsiblePanel>
  );
};

export { ArrowLegend };
