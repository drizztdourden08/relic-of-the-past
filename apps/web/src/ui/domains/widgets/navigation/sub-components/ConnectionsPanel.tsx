/* @layer renderer-widgets @kind component */
import type { CSSProperties } from 'react';
import { landingCrossings, listedCrossings } from '@app/lib/crossing-sections';
import { Box, Text } from '../../../../design-system/primitives';
import { S } from '../styles';
import { CrossingCard } from './CrossingCard';
import { EdgeCard } from './EdgeCard';
import { InternalEdgesSection } from './InternalEdgesSection';
import type { useNavigation } from '../useNavigation';

const IL: Record<string, CSSProperties> = {
  wrapRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  bigEmoji: { fontSize: 18 },
  subTitle: { fontSize: 10, color: 'var(--c-text-dim)', marginBottom: 4, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 },
  firstSubTitle: { fontSize: 10, color: 'var(--c-text-dim)', marginBottom: 4, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  none: { fontSize: 10, color: 'var(--c-text-muted)' },
  screenLabel: { fontSize: 10, color: 'var(--c-info)', marginTop: 2 },
  holeGraphic: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 48, flexShrink: 0, background: 'repeating-linear-gradient(45deg, var(--c-gold) 0px, var(--c-gold) 2px, transparent 2px, transparent 4px)', borderRadius: 'var(--r-sm)' },
};

type Props = Pick<ReturnType<typeof useNavigation>, 'entranceSum' | 'crossings' | 'screenBundle' | 'isIndoors' | 'externalEdges' | 'internalConnections' | 'playerDebug'>;

/** "Connections" panel: entrances, edges, internal edges, fall holes. */
const ConnectionsPanel = (props: Props) => {
  const { entranceSum, crossings, screenBundle, isIndoors, externalEdges, internalConnections, playerDebug } = props;
  const landings = crossings.flatMap(screen => landingCrossings(screen, isIndoors));
  return (
    <Box style={S.section}>
      <Box style={S.sectionTitle}>Connections</Box>

      {/* ─── Entrances sub-section ─── */}
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

      {/* ─── Edges sub-section ─── */}
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

      {/* ─── Internal Edges ─── */}
      <InternalEdgesSection internalConnections={internalConnections} screenBundle={screenBundle} />

      {/* ─── Fall Hole Landings ─── */}
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
