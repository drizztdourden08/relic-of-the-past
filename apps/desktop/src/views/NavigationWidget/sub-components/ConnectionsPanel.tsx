/* @layer renderer-widgets @kind component */
import { landingCrossings, listedCrossings } from '@rotp/navigation';
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { CrossingCard } from './CrossingCard';
import { EdgeCard } from './EdgeCard';
import { InternalEdgesSection } from './InternalEdgesSection';
import type { ConnectionsPanelProps } from './ConnectionsPanel.type';
import './ConnectionsPanel.css';

const ConnectionsPanel = (props: ConnectionsPanelProps) => {
  const { entranceSum, crossings, screenBundle, isIndoors, externalEdges, internalConnections, playerDebug } = props;
  const landings = crossings.flatMap(screen => landingCrossings(screen, isIndoors));
  return (
    <Box className="nav-section">
      <Box className="nav-section-title">Connections</Box>

      <Box className="nav-connections-panel__first-sub-title">Entrances ({entranceSum})</Box>
      {entranceSum === 0 && <Box className="nav-connections-panel__none">None</Box>}
      {crossings.map(screen => {
        const listed = listedCrossings(screen, isIndoors);
        if (listed.length === 0) return null;
        const scrLabel = screenBundle?.isMulti
          ? (screenBundle.screenNames[screen.screenIndex] ?? `0x${screen.screenIndex.toString(16).toUpperCase()}`)
          : null;
        return (
          <Box key={`ent-${screen.screenIndex}`}>
            {scrLabel && <Box className="nav-connections-panel__screen-label">{scrLabel}</Box>}
            <Box className="nav-connections-panel__wrap-row">
              {listed.map(crossing => (
                <CrossingCard key={crossing.id} crossing={crossing} />
              ))}
            </Box>
          </Box>
        );
      })}

      <Box className="nav-connections-panel__sub-title">Edges ({externalEdges.length})</Box>
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
        <Box className="nav-connections-panel__none">None</Box>
      )}

      <InternalEdgesSection internalConnections={internalConnections} screenBundle={screenBundle} />

      {landings.length > 0 && (
        <>
          <Box className="nav-connections-panel__sub-title">Fall Holes ({landings.length})</Box>
          <Box className="nav-connections-panel__wrap-row">
            {landings.map(crossing => (
              <Box key={crossing.id} title={crossing.label} className="nav-card">
                <Box className="nav-connections-panel__hole-graphic">
                  <Icon name="arrow-down" className="nav-connections-panel__big-emoji" />
                </Box>
                <Text className="nav-card-title">Landing Zone</Text>
                <Text className="nav-card-sub">r{crossing.tile.row} c{crossing.tile.col}</Text>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export { ConnectionsPanel };
