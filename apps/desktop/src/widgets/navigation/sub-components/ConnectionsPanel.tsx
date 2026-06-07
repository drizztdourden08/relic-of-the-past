/* @layer renderer-widgets @kind component */
import { Icon } from '@iconify/react/offline';
import { getConnectionDestinationName } from '@shared/game/navigation';
import { SCREEN_BY_ID } from '@shared/game/data/screens';
import { getEntranceIcon } from '../../../lib/entrance-icons';
import { S } from '../styles';
import { getScreenDisplayName } from '../widget-helpers';
import { ReqIcon } from './ReqIcon';
import { EdgeArrowSvg } from './EdgeArrowSvg';
import { InternalEdgesSection } from './InternalEdgesSection';
import type { useNavigation } from '../useNavigation';

type Props = Pick<ReturnType<typeof useNavigation>, 'entranceSum' | 'renderResults' | 'screenBundle' | 'isDarkWorld' | 'roomIndex' | 'isIndoors' | 'respawnEntIds' | 'entranceSpawns' | 'externalConnections' | 'internalConnections' | 'fallHoleLandings' | 'linkDebug'>;

/** "Connections" panel: entrances, edges, internal edges, fall holes. */
const ConnectionsPanel = (props: Props) => {
  const { entranceSum, renderResults, screenBundle, isDarkWorld, roomIndex, isIndoors, respawnEntIds, entranceSpawns, externalConnections, internalConnections, fallHoleLandings, linkDebug } = props;
  return (
    <>
      {/* ═══ 5. CONNECTIONS (unified) ═══ */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Connections</div>

        {/* ─── Entrances sub-section ─── */}
        <div style={{ ...S.meta, color: '#aaa', marginBottom: 4, marginTop: 2, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Entrances ({entranceSum})</div>
        {renderResults.some(r => r.entrances.some(e => r.transitions.some(t => t.entranceIdx === e.id))) ? (
          renderResults.map(r => {
            const reachableEntrances = r.entrances.filter(e => r.transitions.some(t => t.entranceIdx === e.id));
            if (reachableEntrances.length === 0) return null;
            const scrLabel = screenBundle?.isMulti
              ? (screenBundle.screenNames[r.screenIndex] ?? `0x${r.screenIndex.toString(16).toUpperCase()}`)
              : null;
            const screenNodeId = `${isDarkWorld ? 'dw' : 'lw'}-${r.screenIndex.toString(16).padStart(2, '0')}`;
            return (
              <div key={`ent-${r.screenIndex}`}>
                {scrLabel && <div style={{ ...S.meta, color: '#8cf', marginTop: 2 }}>{scrLabel}</div>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
                    displayName = getConnectionDestinationName(screenNodeId, ent.roomId)
                      ?? `Room 0x${ent.roomId.toString(16).toUpperCase()}`;
                  }
                  return (
                    <div key={`entrance-${ent.id}`} style={S.card}>
                      <div style={S.cardGraphic}>
                        <Icon icon={iconData} width={28} height={28} style={{ color: iconColor }} />
                      </div>
                      <span style={S.cardTitle}>{displayName}</span>
                      <span style={S.cardSub}>#{ent.id}</span>
                      {entranceSpawns && ent.id < entranceSpawns.length && (
                        <span style={{ fontSize: 8, color: entranceSpawns[ent.id].startingLayer === 0 ? '#7ff' : '#ff7', marginTop: 1 }}>
                          {entranceSpawns[ent.id].startingLayer === 0 ? '▲ Upper' : '▼ Lower'}
                        </span>
                      )}
                      {t?.requirements && t.requirements.length > 0 && (
                        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>{t.requirements.map(r => <ReqIcon key={r} req={r} />)}</div>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ ...S.meta, color: '#666' }}>None</div>
        )}

        {/* ─── Edges sub-section ─── */}
        <div style={{ ...S.meta, color: '#aaa', marginBottom: 4, marginTop: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Edges ({externalConnections.length})</div>
        {externalConnections.length > 0 ? (
          externalConnections.map(conn => {
            const connKey = `${conn.edge}-${conn.sourceScreen?.toString(16)}-${conn.targetScreen.toString(16)}-${conn.positions[0]}`;
            let targetName: string;
            if (isIndoors) {
              targetName = `Room 0x${conn.targetScreen.toString(16).toUpperCase().padStart(2, '0')}`;
            } else {
              const targetNodeId = `${isDarkWorld ? 'dw' : 'lw'}-${conn.targetScreen.toString(16).padStart(2, '0')}`;
              targetName = SCREEN_BY_ID.get(targetNodeId)?.name ?? `0x${conn.targetScreen.toString(16).toUpperCase()}`;
            }
            const fromLabel = screenBundle?.isMulti && conn.sourceScreen != null
              ? ` (${screenBundle.subNames[conn.sourceScreen] ?? ''})`
              : '';
            const posAxis = conn.edge === 'north' || conn.edge === 'south' ? 'c' : 'r';
            const posRange = conn.positions.length > 0
              ? `${posAxis}${conn.positions[0]}-${conn.positions[conn.positions.length - 1]}`
              : '';
            // Compute target layer if this is a toggle door (XOR current layer)
            const currentLayer = linkDebug?.linkLayer;
            const targetLayerLabel = conn.layerToggle && currentLayer !== null
              ? (currentLayer === 0 ? '→ Lower' : '→ Upper')
              : null;
            return (
              <div key={connKey} style={S.connCard}>
                <div style={S.connHeader}>
                  <EdgeArrowSvg edge={conn.edge} size={16} />
                  <span style={S.connTitle}>{targetName}{fromLabel}</span>
                  <span style={S.dimBadge}>{posRange}</span>
                  <span style={S.dimBadge}>{conn.freeTileCount}{conn.itemTileCount > 0 ? `+${conn.itemTileCount}` : ''}</span>
                </div>
                {isIndoors && (
                  <div style={{ fontSize: 9, marginTop: 2, color: conn.layerToggle ? '#f8a' : '#6a8' }}>
                    {conn.layerToggle
                      ? <>▲▼ Layer Toggle {targetLayerLabel && <span style={{ color: targetLayerLabel.includes('Lower') ? '#ff7' : '#7ff' }}>{targetLayerLabel}</span>}</>
                      : <>═ No Layer Change</>}
                  </div>
                )}
                {conn.requirements.length > 0 && (
                  <div style={S.meta}>{conn.requirements.map(r => <ReqIcon key={r} req={r} />)}</div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ ...S.meta, color: '#666' }}>None</div>
        )}

        {/* ─── Internal Edges ─── */}
        <InternalEdgesSection internalConnections={internalConnections} screenBundle={screenBundle} />

        {/* ─── Fall Hole Landings ─── */}
        {fallHoleLandings.length > 0 && (
          <>
            <div style={{ ...S.meta, color: '#aaa', marginBottom: 4, marginTop: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Fall Holes ({fallHoleLandings.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {fallHoleLandings.map((fh, i) => (
                <div key={`fh-${i}`} style={S.card}>
                  <div style={{ ...S.cardGraphic, background: 'repeating-linear-gradient(45deg, #ffcc44 0px, #ffcc44 2px, transparent 2px, transparent 4px)', borderRadius: 4 }}>
                    <span style={{ fontSize: 18 }}>⬇</span>
                  </div>
                  <span style={S.cardTitle}>Landing Zone</span>
                  <span style={S.cardSub}>r{fh.gridRow} c{fh.gridCol}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export { ConnectionsPanel };
