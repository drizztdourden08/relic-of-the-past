/* @layer renderer-widgets @kind component */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from '@iconify/react/offline';
import { usableEntrances } from '@shared/game/navigation';
import type { ConnectionInfo, ScreenBundle, FloodFillResult } from '@shared/game/navigation';
import { Box, Text } from '../../../../design-system/primitives';
import { getEntranceIcon } from '../../../../../lib/entrance-icons';
import { wasmGetRoomLayoutInfo } from '../../../../../lib/game';
import { useNavigationOverlayStore } from '../../../../../stores/navigation-overlay-store';
import { EDGE_COLORS } from '../navigation.constants';
import { getScreenDisplayName } from '../widget-helpers';
import { ReachabilityCanvas } from './ReachabilityCanvas';
import { AnnotationLayer } from './AnnotationLayer';

interface MinimapProps {
  bundle: ScreenBundle;
  connections: ConnectionInfo[];
  renderResults: FloodFillResult[];
  playerScreenIndex: number | null;
  playerPos: { screen: number; row: number; col: number } | null;
  respawnEntIds: Set<number>;
  roomIndex: number;
}

const COUNT_LABEL: CSSProperties = { position: 'absolute', bottom: 2, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: 'var(--c-text-dim)', pointerEvents: 'none' };

/** Indoor/dungeon minimap: a single full-size rectangle. */
const IndoorMinimap = ({ bundle, connections, renderResults, playerPos, respawnEntIds, roomIndex }: MinimapProps) => {
  const EDGE_PAD = 18;
  const AVAIL = 224;
  const innerSize = AVAIL - EDGE_PAD * 2;

  const mapW = innerSize;
  const mapH = innerSize;

  const borderW = 1;
  const mapLeft = EDGE_PAD;
  const mapTop = EDGE_PAD;
  const mapDivLeft = mapLeft - borderW;
  const mapDivTop = mapTop - borderW;

  const totalW = AVAIL;
  const totalH = AVAIL;

  const externalConns = connections.filter(c => !c.isIntraRoom);
  const fallHoleSpawns = useNavigationOverlayStore(s => s.fallHoleSpawns);
  const annotations = useNavigationOverlayStore(s => s.annotations);

  const primaryResult = renderResults.find(r => r.screenIndex === bundle.head) ?? renderResults[0];

  const layoutInfo = wasmGetRoomLayoutInfo();
  const scrollBoundaries = useMemo(() => {
    if (!layoutInfo) return { horizontal: false, vertical: false };
    const { shape, quadrantFullsizeX, quadrantFullsizeY } = layoutInfo;
    const horizontal = (shape === '2x2' || shape === '1x2') && quadrantFullsizeY === 0;
    const vertical = (shape === '2x2' || shape === '2x1') && quadrantFullsizeX === 0;
    return { horizontal, vertical };
  }, [layoutInfo?.shape, layoutInfo?.quadrantFullsizeX, layoutInfo?.quadrantFullsizeY]);

  const boundaryTiles = useMemo(() => {
    const result: { x: number; y: number; color: string }[] = [];
    if (!primaryResult) return result;
    const reachable = primaryResult.reachable;
    if (scrollBoundaries.horizontal) {
      for (let col = 0; col < 64; col++) {
        if (reachable[31]?.[col] && reachable[32]?.[col]) {
          result.push({ x: mapLeft + ((col + 0.5) / 64) * mapW, y: mapTop + (31.5 / 64) * mapH, color: EDGE_COLORS.south });
          result.push({ x: mapLeft + ((col + 0.5) / 64) * mapW, y: mapTop + (32.5 / 64) * mapH, color: EDGE_COLORS.north });
        }
      }
    }
    if (scrollBoundaries.vertical) {
      for (let row = 0; row < 64; row++) {
        if (reachable[row]?.[31] && reachable[row]?.[32]) {
          result.push({ x: mapLeft + (31.5 / 64) * mapW, y: mapTop + ((row + 0.5) / 64) * mapH, color: EDGE_COLORS.east });
          result.push({ x: mapLeft + (32.5 / 64) * mapW, y: mapTop + ((row + 0.5) / 64) * mapH, color: EDGE_COLORS.west });
        }
      }
    }
    return result;
  }, [primaryResult, scrollBoundaries, mapLeft, mapTop, mapW, mapH]);

  const byEdge: Record<string, ConnectionInfo[]> = { north: [], south: [], east: [], west: [] };
  for (const c of externalConns) {
    if (byEdge[c.edge]) byEdge[c.edge].push(c);
  }

  const textColor = (edge: string) => (edge === 'north' || edge === 'west' ? 'var(--c-text)' : '#000');

  const renderHorizEdge = (list: ConnectionInfo[], prefix: string, top: number) => list.map((c, i) => {
    const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
    const spanW = Math.max(14, ((p1 - p0 + 1) / 64) * mapW);
    const midX = mapLeft + ((p0 + p1 + 1) / 2 / 64) * mapW;
    return (
      <Box key={`${prefix}${i}`} style={{ position: 'absolute', top, left: Math.round(midX - spanW / 2), width: spanW, height: 14, borderRadius: 'var(--r-sm)', background: EDGE_COLORS[c.edge], display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={`${getScreenDisplayName(c.targetScreen)} c${p0}-${p1} (${c.positions.length})`}>
        <Text style={{ fontSize: 9, fontWeight: 700, color: textColor(c.edge), lineHeight: 1 }}>{c.positions.length}</Text>
      </Box>
    );
  });

  const renderVertEdge = (list: ConnectionInfo[], prefix: string, left: number) => list.map((c, i) => {
    const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
    const spanH = Math.max(14, ((p1 - p0 + 1) / 64) * mapH);
    const midY = mapTop + ((p0 + p1 + 1) / 2 / 64) * mapH;
    return (
      <Box key={`${prefix}${i}`} style={{ position: 'absolute', left, top: Math.round(midY - spanH / 2) - 1, width: 14, height: spanH, borderRadius: 'var(--r-sm)', background: EDGE_COLORS[c.edge], display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={`${getScreenDisplayName(c.targetScreen)} r${p0}-${p1} (${c.positions.length})`}>
        <Text style={{ fontSize: 9, fontWeight: 700, color: textColor(c.edge), lineHeight: 1 }}>{c.positions.length}</Text>
      </Box>
    );
  });

  return (
    <Box style={{ position: 'relative', width: '100%', maxWidth: totalW, height: totalH, marginTop: 4, marginLeft: 'auto', marginRight: 'auto' }}>
      <Box style={{ position: 'absolute', left: mapDivLeft, top: mapDivTop, width: mapW, height: mapH, borderRadius: 'var(--r-sm)', background: 'var(--c-green-soft)', border: `${borderW}px solid var(--c-green-soft)`, overflow: 'hidden' }}>
        {primaryResult && <ReachabilityCanvas reachable={primaryResult.reachable} size={mapW} tileLayer={primaryResult.tileLayer} bounds={{ minRow: 0, maxRow: 63, minCol: 0, maxCol: 63 }} />}
        {primaryResult && (
          <Box style={COUNT_LABEL}>
            {primaryResult.reachableCount}/{primaryResult.totalTiles}
          </Box>
        )}
      </Box>

      {renderResults.flatMap(r => usableEntrances(r).map(ent => {
        const x = mapLeft + ((ent.gridCol + 0.5) / 64) * mapW;
        const y = mapTop + ((ent.gridRow + 0.5) / 64) * mapH;
        const sz = Math.max(6, mapW * 4 / 64);
        const { icon: markerIcon, color: markerColor } = getEntranceIcon(ent.id, ent.roomId, roomIndex, true, respawnEntIds);
        return (
          <Box key={`ent-${r.screenIndex}-${ent.id}`} style={{ position: 'absolute', left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={markerIcon} width={sz} height={sz} style={{ color: markerColor, filter: 'drop-shadow(0 0 1px #000)' }} />
          </Box>
        );
      }))}

      {fallHoleSpawns.map((fh, i) => {
        const x = mapLeft + ((fh.gridCol + 0.5) / 64) * mapW;
        const y = mapTop + ((fh.gridRow + 0.5) / 64) * mapH;
        const sz = Math.max(6, mapW * 4 / 64);
        return (
          <Box key={`fh-${i}`} style={{ position: 'absolute', left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, border: '1.5px solid var(--c-gold)', borderRadius: 1, pointerEvents: 'none', background: 'repeating-linear-gradient(45deg, var(--c-gold) 0px, var(--c-gold) 2px, transparent 2px, transparent 4px)', opacity: 0.8 }} />
        );
      })}

      {playerPos && bundle.screens.includes(playerPos.screen) && (() => {
        const x = mapLeft + ((playerPos.col + 0.5) / 64) * mapW;
        const y = mapTop + ((playerPos.row + 0.5) / 64) * mapH;
        return <Box style={{ position: 'absolute', left: x - 3, top: y - 3, width: 6, height: 6, borderRadius: '50%', background: 'var(--c-green)', boxShadow: '0 0 3px var(--c-green)', pointerEvents: 'none' }} />;
      })()}

      <AnnotationLayer annotations={annotations.find(a => a.screenIndex === roomIndex) ?? null} cellLeft={mapLeft} cellTop={mapTop} cellW={mapW} cellH={mapH} />

      {renderHorizEdge(byEdge.north, 'n', mapDivTop - 14 + borderW)}
      {renderHorizEdge(byEdge.south, 's', mapDivTop + mapH + borderW)}
      {renderVertEdge(byEdge.west, 'w', mapDivLeft - 14 + borderW)}
      {renderVertEdge(byEdge.east, 'e', mapDivLeft + mapW + borderW)}

      {boundaryTiles.map((pt, i) => (
        <Box key={`scroll-boundary-${i}`} style={{ position: 'absolute', left: pt.x - 1.5, top: pt.y - 1.5, width: 3, height: 3, borderRadius: '50%', background: pt.color, opacity: 0.8, pointerEvents: 'none' }} />
      ))}
    </Box>
  );
};

export { IndoorMinimap };
export type { MinimapProps };
