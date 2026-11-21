/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { CollapsiblePanel } from './CollapsiblePanel';
import { LegendSwatch } from './LegendSwatch';
import { LegendRow } from './LegendRow';

const DotLegend = () => {
  const t = useT();
  return (
    <CollapsiblePanel title={t('views-game-layer:legend.dots.title')}>
      <Text className="nav-legend__head">{t('views-game-layer:legend.dots.ringHead')}</Text>
      <LegendRow><LegendSwatch color="var(--c-info)" ring /><Text className="nav-legend__dim">{t('views-game-layer:legend.dots.ground')}</Text></LegendRow>
      <LegendRow><LegendSwatch color="var(--c-primary)" ring /><Text className="nav-legend__dim">{t('views-game-layer:legend.dots.above')}</Text></LegendRow>
      <LegendRow><LegendSwatch color="#000" ring /><Text className="nav-legend__dim">{t('views-game-layer:legend.dots.both')}</Text></LegendRow>

      <Text className="nav-legend__head">{t('views-game-layer:legend.dots.fillHead')}</Text>
      <LegendRow><LegendSwatch color="rgba(80,200,255,0.6)" /><Text className="nav-legend__dim">{t('views-game-layer:legend.dots.reachable')}</Text></LegendRow>
      <LegendRow><LegendSwatch color="rgba(255,100,180,0.35)" /><Text className="nav-legend__dim">{t('views-game-layer:legend.dots.needsItem')}</Text></LegendRow>
      <LegendRow><LegendSwatch color="#000" halo="#fff" /><Text className="nav-legend__dim">{t('views-game-layer:legend.dots.floodStart')}</Text></LegendRow>
      <Text className="nav-legend__note">{t('views-game-layer:legend.dots.note')}</Text>
    </CollapsiblePanel>
  );
};

export { DotLegend };
