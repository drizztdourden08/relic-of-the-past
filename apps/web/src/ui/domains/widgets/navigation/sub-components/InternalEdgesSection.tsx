/* @layer renderer-widgets @kind component */
import type { ConnectionInfo } from '@shared/game/navigation';
import { Box, Text } from '../../../../design-system/primitives';
import { S } from '../styles';
import { InternalEdgeSvg } from './InternalEdgeSvg';
import { IL } from './InternalEdgesSection.constants';
import type { InternalEdgesSectionProps } from './InternalEdgesSection.type';

const InternalEdgesSection = (props: InternalEdgesSectionProps) => {
  const { internalConnections, screenBundle } = props;
  if (internalConnections.length === 0) return null;

  const opposites: Record<string, string> = { north: 'south', south: 'north', east: 'west', west: 'east' };
  const fromEdges = internalConnections.filter(c =>
    c.isIntraRoom ? (c.edge === 'south' || c.edge === 'east') : true
  );
  const interScreen = internalConnections.filter(c => !c.isIntraRoom);
  const intraFrom = fromEdges.filter(c => c.isIntraRoom);

  const cards: { conn: ConnectionInfo; paired: ConnectionInfo | undefined }[] = [];
  for (const conn of intraFrom) {
    const opp = internalConnections.find(c =>
      c.edge === opposites[conn.edge] && c.isIntraRoom &&
      c.positions[0] === conn.positions[0]
    );
    cards.push({ conn, paired: opp });
  }
  for (const conn of interScreen) {
    cards.push({ conn, paired: undefined });
  }

  const count = cards.length;
  return (
    <>
      <Box style={{ ...S.meta, color: 'var(--c-text-dim)', marginBottom: 4, marginTop: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Internal ({count})</Box>
      <Box style={IL.wrapRow}>
        {cards.map(({ conn, paired }, i) => {
          if (screenBundle?.isMulti && !conn.isIntraRoom) {
            const fromName = screenBundle.subNames[conn.sourceScreen!] ?? '?';
            const toName = screenBundle.subNames[conn.targetScreen] ?? '?';
            return (
              <Box key={`int-${i}`} style={S.card}>
                <Box style={S.cardGraphic}>
                  <InternalEdgeSvg edge={conn.edge} fromName={fromName} toName={toName} />
                </Box>
                <Text style={{ fontSize: 8, color: conn.layerToggle ? 'var(--c-info)' : 'var(--c-green)', marginTop: 2 }}>
                  {conn.layerToggle ? '▲▼ Toggle' : '═ Same'}
                </Text>
              </Box>
            );
          }
          const fromCount = String(conn.freeTileCount);
          const toCount = String(paired?.freeTileCount ?? conn.freeTileCount);
          return (
            <Box key={`int-${i}`} style={S.card}>
              <Box style={S.cardGraphic}>
                <InternalEdgeSvg edge={conn.edge} fromName={fromCount} toName={toCount} />
              </Box>
              <Text style={IL.same}>
                ═ Same
              </Text>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export { InternalEdgesSection };
