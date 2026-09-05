/* @layer renderer-components @kind component */
// The RING says which layer(s) the flood reached the tile on, the FILL says what kind of result that was.
import type { CSSProperties, ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { CollapsiblePanel } from './CollapsiblePanel';

const S: Record<string, CSSProperties> = {
  row: { display: 'flex', alignItems: 'center', gap: 5 },
  dim: { color: 'var(--c-text-dim)' },
  head: {
    color: 'var(--c-text-faint)', textTransform: 'uppercase',
    letterSpacing: '0.06em', fontSize: 9, marginTop: 3,
  },
  note: { color: 'var(--c-text-faint)', fontSize: 9 },
};

/** Ring-only swatch (transparent centre) or a filled one. */
const Swatch = ({ color, ring, halo }: { color: string; ring?: boolean; halo?: string }) => (
  <Box style={{
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box',
    background: ring ? 'transparent' : color,
    border: ring ? `2px solid ${color}` : (halo ? `2px solid ${halo}` : 'none'),
  }} />
);

const Row = ({ children }: { children: ReactNode }) => <Box style={S.row}>{children}</Box>;

const DotLegend = () => {
  return (
    <CollapsiblePanel title="dots">
      <Text style={S.head}>ring shows the layer</Text>
      <Row><Swatch color="var(--c-info)" ring /><Text style={S.dim}>ground</Text></Row>
      <Row><Swatch color="var(--c-gold)" ring /><Text style={S.dim}>above</Text></Row>
      <Row><Swatch color="#000" ring /><Text style={S.dim}>both layers</Text></Row>

      <Text style={S.head}>fill shows the flood result</Text>
      <Row><Swatch color="rgba(80,200,255,0.6)" /><Text style={S.dim}>reachable</Text></Row>
      <Row><Swatch color="rgba(255,100,180,0.35)" /><Text style={S.dim}>needs an item</Text></Row>
      <Row><Swatch color="#000" halo="#fff" /><Text style={S.dim}>flood start</Text></Row>
      <Text style={S.note}>no dot means unreachable, or an arrow instead</Text>
    </CollapsiblePanel>
  );
};

export { DotLegend };
