/* @layer renderer-widgets @kind component */
import { landingCrossings, listedCrossings } from '@app/lib/crossing-sections';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { S } from '../styles';
import { CrossingCard } from './CrossingCard';
import { EdgeCard } from './EdgeCard';
import { InternalEdgesSection } from './InternalEdgesSection';
import { IL } from './ConnectionsPanel.constants';
import type { ConnectionsPanelProps } from './ConnectionsPanel.type';

const ConnectionsPanel = (props: ConnectionsPanelProps) => {
  const { entranceSum, crossings, screenBundle, isIndoors, externalEdges, internalConnections, playerDebug } = props;
  const landings = crossings.flatMap(screen => landingCrossings(screen, isIndoors));
  return (
    <Box style={S.section}>
      <Box style={S.sectionTitle}>Connections</Box>

      <Box style={IL.firstSubTitle}>Entrances ({entranceSum})</Box>
      {entranceSum === 0 && <Box style={IL.none}>None</Box>}
      {crossings.map(screen => {
        const listed = listedCrossings(screen, isIndoors);
        if (listed.length === 0) return null;
        const scrLabel = screenBundle?.isMulti
          ? (screenBundle.screenNames[screen.screenIndex] ?? `0x${screen.screenIndex.toString(16).toUpperCase()}`)
          : null;
        return (
          <Box key={`ent-${screen.screenIndex}`}>
            {scrLabel && <Box style={IL.screenLabel}>{scrLabel}</Box>}
            <Box style={IL.wrapRow}>
              {listed.map(crossing => (
                <CrossingCard key={crossing.id} crossing={crossing} />
              ))}
            </Box>
          </Box>
        );
      })}

      <Box style={IL.subTitle}>Edges ({externalEdges.length})</Box>
      {externalEdges.length > 0 ? (
        externalEdges.map(row => (
          <EdgeCard
            key={`${row.sourceScreen}-${row.crossing.id}`}
            row={row}
            screenBundle={screenBundle}
            isIndoors={isIndoors}
            playerLayer={playerDebug?.playerLayer}
          />
        ))
      ) : (
        <Box style={IL.none}>None</Box>
      )}

      <InternalEdgesSection internalConnections={internalConnections} screenBundle={screenBundle} />

      {landings.length > 0 && (
        <>
          <Box style={IL.subTitle}>Fall Holes ({landings.length})</Box>
          <Box style={IL.wrapRow}>
            {landings.map(crossing => (
              <Box key={crossing.id} style={S.card} title={crossing.label}>
                <Box style={IL.holeGraphic}>
                  <Text style={IL.bigEmoji}>⬇</Text>
                </Box>
                <Text style={S.cardTitle}>Landing Zone</Text>
                <Text style={S.cardSub}>r{crossing.tile.row} c{crossing.tile.col}</Text>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export { ConnectionsPanel };
