/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { CollapsiblePanel } from './CollapsiblePanel';
import { LegendSwatch } from './LegendSwatch';
import { LegendRow } from './LegendRow';

const DotLegend = () => {
  return (
    <CollapsiblePanel title="dots">
      <Text className="nav-legend__head">ring shows the layer</Text>
      <LegendRow><LegendSwatch color="var(--c-info)" ring /><Text className="nav-legend__dim">ground</Text></LegendRow>
      <LegendRow><LegendSwatch color="var(--c-primary)" ring /><Text className="nav-legend__dim">above</Text></LegendRow>
      <LegendRow><LegendSwatch color="#000" ring /><Text className="nav-legend__dim">both layers</Text></LegendRow>

      <Text className="nav-legend__head">fill shows the flood result</Text>
      <LegendRow><LegendSwatch color="rgba(80,200,255,0.6)" /><Text className="nav-legend__dim">reachable</Text></LegendRow>
      <LegendRow><LegendSwatch color="rgba(255,100,180,0.35)" /><Text className="nav-legend__dim">needs an item</Text></LegendRow>
      <LegendRow><LegendSwatch color="#000" halo="#fff" /><Text className="nav-legend__dim">flood start</Text></LegendRow>
      <Text className="nav-legend__note">no dot means unreachable, or an arrow instead</Text>
    </CollapsiblePanel>
  );
};

export { DotLegend };
