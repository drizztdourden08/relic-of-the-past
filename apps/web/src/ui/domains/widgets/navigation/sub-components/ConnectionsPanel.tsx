/* @layer renderer-widgets @kind component */
import type { CSSProperties } from 'react';
import { Icon } from '@iconify/react/offline';
import { getConnectionDestinationName, usableEntrances } from '@shared/game/navigation';
import { getScreenByGameId } from '@shared/game/data';
import type { ScreenId } from '@shared/game/data';
import { Box, Text } from '../../../../design-system/primitives';
import { getEntranceIcon } from '../../../../../lib/entrance-icons';
import { S } from '../styles';
import { getScreenDisplayName } from '../widget-helpers';
import { ReqIcon } from './ReqIcon';
import { EdgeArrowSvg } from './EdgeArrowSvg';
import { InternalEdgesSection } from './InternalEdgesSection';
import type { useNavigation } from '../useNavigation';

const IL: Record<string, CSSProperties> = {
  wrapRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  reqRow: { display: 'flex', gap: 2, marginTop: 2 },
  bigEmoji: { fontSize: 18 },
};

type Props = Pick<ReturnType<typeof useNavigation>, 'entranceSum' | 'renderResults' | 'screenBundle' | 'isDarkWorld' | 'roomIndex' | 'isIndoors' | 'respawnEntIds' | 'entranceSpawns' | 'externalConnections' | 'internalConnections' | 'fallHoleLandings' | 'playerDebug'>;

/** "Connections" panel: entrances, edges, internal edges, fall holes. */
const ConnectionsPanel = (props: Props) => {
  const { entranceSum, renderResults, screenBundle, isDarkWorld, roomIndex, isIndoors, respawnEntIds, entranceSpawns, externalConnections, internalConnections, fallHoleLandings, playerDebug } = props;
  return (
    <>
      {/* ═══ 5. CONNECTIONS (unified) ═══ */}
      <Box style={S.section}>
        <Box style={S.sectionTitle}>Connections</Box>

        {/* ─── Entrances sub-section ─── */}
        <Box style={{ ...S.meta, color: 'var(--c-text-dim)', marginBottom: 4, marginTop: 2, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Entrances ({entranceSum})</Box>
        {renderResults.some(r => usableEntrances(r).length > 0) ? (
          renderResults.map(r => {
            const reachableEntrances = usableEntrances(r);
            if (reachableEntrances.length === 0) return null;
            const scrLabel = screenBundle?.isMulti
              ? (screenBundle.screenNames[r.screenIndex] ?? `0x${r.screenIndex.toString(16).toUpperCase()}`)
              : null;
            // overworldIndex is the unified 0x00-0x7F space (dark world offset by 0x40),
            // not the per-world range r.screenIndex carries.
            const sourceScreenId: ScreenId | undefined = getScreenByGameId({
              overworldIndex: isDarkWorld ? r.screenIndex + 0x40 : r.screenIndex,
            })?.id;
            return (
              <Box key={`ent-${r.screenIndex}`}>
                {scrLabel && <Box style={{ ...S.meta, color: 'var(--c-info)', marginTop: 2 }}>{scrLabel}</Box>}
                <Box style={IL.wrapRow}>
                {reachableEntrances.map(ent => {
                  const t = r.transitions.find(t => t.entranceIdx === ent.id);
                  const isRespawn = respawnEntIds.has(ent.id);
                  const { icon: iconData, color: iconColor } = getEntranceIcon(ent.id, ent.roomId, roomIndex, isIndoors, respawnEntIds);
                  const isSyntheticIndoor = ent.id >= 1000 && isIndoors;
                  const isIndoorOverworldEntrance = isIndoors && ent.id < 1000;
                  let displayName: string;
                  if (isRespawn) {
                    displayName = 'Respawn Point';
                  } else if (isSyntheticIndoor) {
                    displayName = `Room 0x${ent.roomId.toString(16).toUpperCase()}`;
                  } else if (isIndoorOverworldEntrance) {
                    displayName = ent.roomId >= 0
                      ? (getScreenDisplayName(ent.roomId))
                      : 'Overworld';
                  } else {
                    displayName = (sourceScreenId ? getConnectionDestinationName(sourceScreenId, ent.roomId) : null)
                      ?? `Room 0x${ent.roomId.toString(16).toUpperCase()}`;
                  }
                  return (
                    <Box key={`entrance-${ent.id}`} style={S.card}>
                      <Box style={S.cardGraphic}>
                        <Icon icon={iconData} width={28} height={28} style={{ color: iconColor }} />
                      </Box>
                      <Text style={S.cardTitle}>{displayName}</Text>
                      <Text style={S.cardSub}>#{ent.id}</Text>
                      {entranceSpawns && ent.id < entranceSpawns.length && (
                        <Text style={{ fontSize: 8, color: entranceSpawns[ent.id].startingLayer === 0 ? 'var(--c-info)' : 'var(--c-info)', marginTop: 1 }}>
                          {entranceSpawns[ent.id].startingLayer === 0 ? '▲ Upper' : '▼ Lower'}
                        </Text>
                      )}
                      {t?.requirements && t.requirements.length > 0 && (
                        <Box style={IL.reqRow}>{t.requirements.map(r => <ReqIcon key={r} req={r} />)}</Box>
                      )}
                    </Box>
                  );
                })}
                </Box>
              </Box>
            );
          })
        ) : (
          <Box style={{ ...S.meta, color: 'var(--c-text-muted)' }}>None</Box>
        )}

        {/* ─── Edges sub-section ─── */}
        <Box style={{ ...S.meta, color: 'var(--c-text-dim)', marginBottom: 4, marginTop: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Edges ({externalConnections.length})</Box>
        {externalConnections.length > 0 ? (
          externalConnections.map(conn => {
            const connKey = `${conn.edge}-${conn.sourceScreen?.toString(16)}-${conn.targetScreen.toString(16)}-${conn.positions[0]}`;
            let targetName: string;
            if (isIndoors) {
              targetName = `Room 0x${conn.targetScreen.toString(16).toUpperCase().padStart(2, '0')}`;
            } else {
              // overworldIndex is a unified 0x00-0x7F space (dark world offset by 0x40),
              // not the per-world 0x00-0x3F range conn.targetScreen carries.
              const target = getScreenByGameId({ overworldIndex: isDarkWorld ? conn.targetScreen + 0x40 : conn.targetScreen });
              targetName = target ? (target.vanillaName ?? target.randomizerName) : `0x${conn.targetScreen.toString(16).toUpperCase()}`;
            }
            const fromLabel = screenBundle?.isMulti && conn.sourceScreen != null
              ? ` (${screenBundle.subNames[conn.sourceScreen] ?? ''})`
              : '';
            const posAxis = conn.edge === 'north' || conn.edge === 'south' ? 'c' : 'r';
            const posRange = conn.positions.length > 0
              ? `${posAxis}${conn.positions[0]}-${conn.positions[conn.positions.length - 1]}`
              : '';
            // Compute target layer if this is a toggle door (XOR current layer)
            const currentLayer = playerDebug?.playerLayer;
            const targetLayerLabel = conn.layerToggle && currentLayer !== null
              ? (currentLayer === 0 ? '→ Lower' : '→ Upper')
              : null;
            return (
              <Box key={connKey} style={S.connCard}>
                <Box style={S.connHeader}>
                  <EdgeArrowSvg edge={conn.edge} size={16} />
                  <Text style={S.connTitle}>{targetName}{fromLabel}</Text>
                  <Text style={S.dimBadge}>{posRange}</Text>
                  <Text style={S.dimBadge}>{conn.freeTileCount}{conn.itemTileCount > 0 ? `+${conn.itemTileCount}` : ''}</Text>
                </Box>
                {isIndoors && (
                  <Box style={{ fontSize: 9, marginTop: 2, color: conn.layerToggle ? 'var(--c-info)' : 'var(--c-green)' }}>
                    {conn.layerToggle
                      ? <>▲▼ Layer Toggle {targetLayerLabel && <Text style={{ color: targetLayerLabel.includes('Lower') ? 'var(--c-info)' : 'var(--c-info)' }}>{targetLayerLabel}</Text>}</>
                      : <>═ No Layer Change</>}
                  </Box>
                )}
                {conn.requirements.length > 0 && (
                  <Box style={S.meta}>{conn.requirements.map(r => <ReqIcon key={r} req={r} />)}</Box>
                )}
              </Box>
            );
          })
        ) : (
          <Box style={{ ...S.meta, color: 'var(--c-text-muted)' }}>None</Box>
        )}

        {/* ─── Internal Edges ─── */}
        <InternalEdgesSection internalConnections={internalConnections} screenBundle={screenBundle} />

        {/* ─── Fall Hole Landings ─── */}
        {fallHoleLandings.length > 0 && (
          <>
            <Box style={{ ...S.meta, color: 'var(--c-text-dim)', marginBottom: 4, marginTop: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Fall Holes ({fallHoleLandings.length})</Box>
            <Box style={IL.wrapRow}>
              {fallHoleLandings.map((fh, i) => (
                <Box key={`fh-${i}`} style={S.card}>
                  <Box style={{ ...S.cardGraphic, background: 'repeating-linear-gradient(45deg, var(--c-gold) 0px, var(--c-gold) 2px, transparent 2px, transparent 4px)', borderRadius: 'var(--r-sm)' }}>
                    <Text style={IL.bigEmoji}>⬇</Text>
                  </Box>
                  <Text style={S.cardTitle}>Landing Zone</Text>
                  <Text style={S.cardSub}>r{fh.gridRow} c{fh.gridCol}</Text>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export { ConnectionsPanel };
