/* @layer renderer-widgets @kind component */
import type { ConnectionInfo } from '@shared/game/navigation';
import { Box, Text } from '../../../../design-system/primitives';
import { S } from '../styles';
import { InternalEdgeSvg } from './InternalEdgeSvg';
import type { useNavigation } from '../useNavigation';

type Props = Pick<ReturnType<typeof useNavigation>, 'internalConnections' | 'screenBundle'>;

/** Internal edges sub-section: intra-room boundary pairs + inter-screen internals. */
const InternalEdgesSection = (props: Props) => {
  const { internalConnections, screenBundle } = props;
  if (internalConnections.length === 0) return null;

  // Group intra-room connections into boundary pairs (south↔north, east↔west).
  // Each contiguous run on one side matches a run on the opposite side.
  const opposites: Record<string, string> = { north: 'south', south: 'north', east: 'west', west: 'east' };
  // Pick one side per axis (prefer south/east as "from")
  const fromEdges = internalConnections.filter(c =>
    c.isIntraRoom ? (c.edge === 'south' || c.edge === 'east') : true
  );
  // For overworld inter-screen internals, keep as-is
  const interScreen = internalConnections.filter(c => !c.isIntraRoom);
  const intraFrom = fromEdges.filter(c => c.isIntraRoom);

  const cards: { conn: ConnectionInfo; paired: ConnectionInfo | undefined }[] = [];
  for (const conn of intraFrom) {
    // Find the matching opposite run (same positions overlap)
    const opp = internalConnections.find(c =>
      c.edge === opposites[conn.edge] && c.isIntraRoom &&
      c.positions[0] === conn.positions[0]
    );
    cards.push({ conn, paired: opp });
  }
  // Add inter-screen internals as unpaired
  for (const conn of interScreen) {
    cards.push({ conn, paired: undefined });
  }

  const count = cards.length;
  return (
    <>
      <Box style={{ ...S.meta, color: '#aaa', marginBottom: 4, marginTop: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Internal ({count})</Box>
      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {cards.map(({ conn, paired }, i) => {
          if (screenBundle?.isMulti && !conn.isIntraRoom) {
            const fromName = screenBundle.subNames[conn.sourceScreen!] ?? '?';
            const toName = screenBundle.subNames[conn.targetScreen] ?? '?';
            return (
              <Box key={`int-${i}`} style={S.card}>
                <Box style={S.cardGraphic}>
                  <InternalEdgeSvg edge={conn.edge} fromName={fromName} toName={toName} />
                </Box>
                <Text style={{ fontSize: 8, color: conn.layerToggle ? '#f8a' : '#6a8', marginTop: 2 }}>
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
              <Text style={{ fontSize: 8, color: '#6a8', marginTop: 2 }}>
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
