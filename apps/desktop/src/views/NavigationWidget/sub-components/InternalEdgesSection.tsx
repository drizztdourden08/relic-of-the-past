/* @layer renderer-widgets @kind component */
import type { ConnectionInfo } from '@rotp/game-core';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { InternalEdgeSvg } from './InternalEdgeSvg';
import { sourceSubName } from '../behavior/source-sub-name';
import type { InternalEdgesSectionProps } from './InternalEdgesSection.type';
import './InternalEdgesSection.css';

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
      <Box className="nav-internal-edges-section__meta">Internal ({count})</Box>
      <Box className="nav-internal-edges-section__wrap-row">
        {cards.map(({ conn, paired }, i) => {
          if (screenBundle?.isMulti && !conn.isIntraRoom) {
            const fromName = sourceSubName(conn, screenBundle);
            const toName = screenBundle.subNames[conn.targetScreen] ?? '?';
            return (
              <Box key={`int-${i}`} className="nav-card">
                <Box className="nav-card-graphic">
                  <InternalEdgeSvg edge={conn.edge} fromName={fromName} toName={toName} />
                </Box>
                <Text className={conn.layerToggle ? 'nav-internal-edges-section__layer nav-val-info' : 'nav-internal-edges-section__layer nav-val-green'}>
                  {conn.layerToggle ? '▲▼ Toggle' : '═ Same'}
                </Text>
              </Box>
            );
          }
          const fromCount = String(conn.freeTileCount);
          const toCount = String(paired?.freeTileCount ?? conn.freeTileCount);
          return (
            <Box key={`int-${i}`} className="nav-card">
              <Box className="nav-card-graphic">
                <InternalEdgeSvg edge={conn.edge} fromName={fromCount} toName={toCount} />
              </Box>
              <Text className="nav-internal-edges-section__same">
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
