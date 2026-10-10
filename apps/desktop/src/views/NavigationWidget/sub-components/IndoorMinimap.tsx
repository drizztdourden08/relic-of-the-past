/* @layer renderer-widgets @kind component */
import { useMemo } from 'react';
import { Icon } from '@iconify/react/offline';
import type { ConnectionInfo } from '@rotp/game-core';
import { landingCrossings, markerCrossings, crossingIcon } from '@rotp/navigation';
import { Box } from '@drizztdourden08/tessera/primitives';
import { wasmGetRoomLayoutInfo } from '../../../game';
import { useNavigationOverlayStore } from '../../../stores/navigation-overlay-store';
import { EDGE_COLOR_BY_SIDE as EDGE_COLORS } from '../NavigationWidget.constants';
import { getScreenDisplayName } from '../../../nav-widget/widget-helpers';
import { ReachabilityCanvas } from './ReachabilityCanvas';
import { AnnotationLayer } from './AnnotationLayer';
import { EdgeBadge } from './EdgeBadge';
import { groupByEdge } from '../behavior/group-by-edge';
import { positionSpan } from '../behavior/position-span';
import { markerTone } from '../behavior/marker-tone';
import type { MinimapProps } from './IndoorMinimap.type';
import './IndoorMinimap.css';

const IndoorMinimap = ({ bundle, connections, renderResults, playerPos, roomIndex }: MinimapProps) => {
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
  const crossings = useNavigationOverlayStore(s => s.crossings);
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

  const byEdge = groupByEdge(externalConns);

  const renderHorizEdge = (list: ConnectionInfo[], prefix: string, top: number) => list.map((c, i) => {
    const { first: p0, last: p1 } = positionSpan(c.positions);
    const spanW = Math.max(14, ((p1 - p0 + 1) / 64) * mapW);
    const midX = mapLeft + ((p0 + p1 + 1) / 2 / 64) * mapW;
    const box = { top, left: Math.round(midX - spanW / 2), width: spanW, height: 14 };
    return <EdgeBadge key={`${prefix}${i}`} connection={c} box={box} title={`${getScreenDisplayName(c.targetScreen)} c${p0}-${p1} (${c.positions.length})`} />;
  });

  const renderVertEdge = (list: ConnectionInfo[], prefix: string, left: number) => list.map((c, i) => {
    const { first: p0, last: p1 } = positionSpan(c.positions);
    const spanH = Math.max(14, ((p1 - p0 + 1) / 64) * mapH);
    const midY = mapTop + ((p0 + p1 + 1) / 2 / 64) * mapH;
    const box = { top: Math.round(midY - spanH / 2) - 1, left, width: 14, height: spanH };
    return <EdgeBadge key={`${prefix}${i}`} connection={c} box={box} title={`${getScreenDisplayName(c.targetScreen)} r${p0}-${p1} (${c.positions.length})`} />;
  });

  return (
    <Box style={{ maxWidth: totalW, height: totalH }} className="nav-indoor-minimap__root">
      <Box style={{ left: mapDivLeft, top: mapDivTop, width: mapW, height: mapH, border: `${borderW}px solid var(--c-secondary-soft)` }} className="nav-indoor-minimap__map-frame">
        {primaryResult && <ReachabilityCanvas reachable={primaryResult.reachable} size={mapW} tileLayer={primaryResult.tileLayer} bounds={{ minRow: 0, maxRow: 63, minCol: 0, maxCol: 63 }} />}
        {primaryResult && (
          <Box className="nav-indoor-minimap__count-label">
            {primaryResult.reachableCount}/{primaryResult.totalTiles}
          </Box>
        )}
      </Box>

      {crossings.flatMap(screen => markerCrossings(screen, true).map(crossing => {
        const x = mapLeft + ((crossing.tile.col + 0.5) / 64) * mapW;
        const y = mapTop + ((crossing.tile.row + 0.5) / 64) * mapH;
        const sz = Math.max(6, mapW * 4 / 64);
        const { icon: markerIcon } = crossingIcon(crossing);
        return (
          <Box key={`ent-${screen.screenIndex}-${crossing.id}`} style={{ left: x - sz / 2, top: y - sz / 2, width: sz, height: sz }} title={crossing.label} className="nav-indoor-minimap__marker">
            <Icon icon={markerIcon} width={sz} height={sz} className="nav-marker-icon nav-marker-icon--shadowed" data-tone={markerTone(crossing)} />
          </Box>
        );
      }))}

      {crossings.flatMap(screen => landingCrossings(screen, true).map(crossing => {
        const x = mapLeft + ((crossing.tile.col + 0.5) / 64) * mapW;
        const y = mapTop + ((crossing.tile.row + 0.5) / 64) * mapH;
        const sz = Math.max(6, mapW * 4 / 64);
        return (
          <Box key={`fh-${screen.screenIndex}-${crossing.id}`} style={{ left: x - sz / 2, top: y - sz / 2, width: sz, height: sz }} className="nav-indoor-minimap__fall-hole" />
        );
      }))}

      {playerPos && bundle.screens.includes(playerPos.screen) && (() => {
        const x = mapLeft + ((playerPos.col + 0.5) / 64) * mapW;
        const y = mapTop + ((playerPos.row + 0.5) / 64) * mapH;
        return <Box style={{ left: x - 3, top: y - 3 }} className="nav-indoor-minimap__player-dot" />;
      })()}

      <AnnotationLayer annotations={annotations.find(a => a.screenIndex === roomIndex) ?? null} cellLeft={mapLeft} cellTop={mapTop} cellW={mapW} cellH={mapH} />

      {renderHorizEdge(byEdge.north, 'n', mapDivTop - 14 + borderW)}
      {renderHorizEdge(byEdge.south, 's', mapDivTop + mapH + borderW)}
      {renderVertEdge(byEdge.west, 'w', mapDivLeft - 14 + borderW)}
      {renderVertEdge(byEdge.east, 'e', mapDivLeft + mapW + borderW)}

      {boundaryTiles.map((pt, i) => (
        <Box key={`scroll-boundary-${i}`} style={{ left: pt.x - 1.5, top: pt.y - 1.5, background: pt.color }} className="nav-indoor-minimap__boundary-dot" />
      ))}
    </Box>
  );
};

export { IndoorMinimap };
