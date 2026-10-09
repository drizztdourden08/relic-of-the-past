/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { CollapsiblePanel } from './CollapsiblePanel';
import { LegendSwatch } from './sub-components/LegendSwatch';
import { LegendRow } from './sub-components/LegendRow';

const S: Record<string, CSSProperties> = {
  dim: { color: 'var(--c-text-dim)' },
  head: {
    color: 'var(--c-text-faint)', textTransform: 'uppercase',
    letterSpacing: '0.06em', fontSize: 9, marginTop: 3,
  },
  note: { color: 'var(--c-text-faint)', fontSize: 9 },
};

const DotLegend = () => {
  return (
    <CollapsiblePanel title="dots">
      <Text style={S.head}>ring shows the layer</Text>
      <LegendRow><LegendSwatch color="var(--c-info)" ring /><Text style={S.dim}>ground</Text></LegendRow>
      <LegendRow><LegendSwatch color="var(--c-primary)" ring /><Text style={S.dim}>above</Text></LegendRow>
      <LegendRow><LegendSwatch color="#000" ring /><Text style={S.dim}>both layers</Text></LegendRow>

      <Text style={S.head}>fill shows the flood result</Text>
      <LegendRow><LegendSwatch color="rgba(80,200,255,0.6)" /><Text style={S.dim}>reachable</Text></LegendRow>
      <LegendRow><LegendSwatch color="rgba(255,100,180,0.35)" /><Text style={S.dim}>needs an item</Text></LegendRow>
      <LegendRow><LegendSwatch color="#000" halo="#fff" /><Text style={S.dim}>flood start</Text></LegendRow>
      <Text style={S.note}>no dot means unreachable, or an arrow instead</Text>
    </CollapsiblePanel>
  );
};

export { DotLegend };
