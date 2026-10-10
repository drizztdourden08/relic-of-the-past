/* @layer renderer-widgets @kind component */
import { Icon } from '@iconify/react/offline';
import type { ConnectionInfo } from '@rotp/game-core';
import { markerCrossings, crossingIcon } from '@rotp/navigation';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useNavigationOverlayStore } from '../../../stores/navigation-overlay-store';
import { getScreenDisplayName } from '../../../nav-widget/widget-helpers';
import { ReachabilityCanvas } from './ReachabilityCanvas';
import { AnnotationLayer } from './AnnotationLayer';
import { EdgeBadge } from './EdgeBadge';
import { groupByEdge } from '../behavior/group-by-edge';
import { positionSpan } from '../behavior/position-span';
import { IL } from './OverworldMinimap.constants';
import type { MinimapProps } from './IndoorMinimap.type';

const OverworldMinimap = ({ bundle, connections, renderResults, playerScreenIndex, playerPos }: MinimapProps) => {
  const EDGE_PAD = 18;
  const GAP = 2;
  const AVAIL = 224;

  const gridCols = bundle.cols;
  const gridRows = bundle.rows;

  const cellW = Math.floor((AVAIL - EDGE_PAD * 2 - (gridCols - 1) * GAP) / gridCols);
  const cellH = cellW;
  const gridW = gridCols * cellW + (gridCols - 1) * GAP;
  const gridH = gridRows * cellH + (gridRows - 1) * GAP;
  const totalW = gridW + EDGE_PAD * 2;
  const totalH = gridH + EDGE_PAD * 2;

  const externalConns = connections.filter(c => !c.isIntraRoom);
  const crossings = useNavigationOverlayStore(s => s.crossings);
  const annotations = useNavigationOverlayStore(s => s.annotations);

  const byEdge = groupByEdge(externalConns);

  const screenSlot = (c: ConnectionInfo): number => (c.sourceScreen === undefined ? -1 : bundle.screens.indexOf(c.sourceScreen));

  const renderHorizEdge = (list: ConnectionInfo[], prefix: string, top: number) => list.map((c, i) => {
    const scrIdx = screenSlot(c);
    const col = scrIdx >= 0 ? scrIdx % bundle.cols : 0;
    const colStart = EDGE_PAD + col * (cellW + GAP);
    const { first: p0, last: p1 } = positionSpan(c.positions);
    const x0 = (p0 / 64) * cellW;
    const spanW = Math.max(14, ((p1 - p0 + 1) / 64) * cellW);
    const box = { top, left: colStart + x0, width: spanW, height: 14 };
    return <EdgeBadge key={`${prefix}${i}`} connection={c} box={box} title={`${getScreenDisplayName(c.targetScreen)} c${p0}-${p1} (${c.positions.length})`} />;
  });

  const renderVertEdge = (list: ConnectionInfo[], prefix: string, left: number) => list.map((c, i) => {
    const scrIdx = screenSlot(c);
    const row = scrIdx >= 0 ? Math.floor(scrIdx / bundle.cols) : 0;
    const rowStart = EDGE_PAD + row * (cellH + GAP);
    const { first: p0, last: p1 } = positionSpan(c.positions);
    const y0 = (p0 / 64) * cellH;
    const spanH = Math.max(14, ((p1 - p0 + 1) / 64) * cellH);
    const box = { top: rowStart + y0, left, width: 14, height: spanH };
    return <EdgeBadge key={`${prefix}${i}`} connection={c} box={box} title={`${getScreenDisplayName(c.targetScreen)} r${p0}-${p1} (${c.positions.length})`} />;
  });

  return (
    <Box style={{ position: 'relative', width: '100%', maxWidth: totalW, height: totalH, marginTop: 4, marginLeft: 'auto', marginRight: 'auto' }}>
      {bundle.screens.map((scr, idx) => {
        const col = idx % bundle.cols;
        const row = Math.floor(idx / bundle.cols);
        const isActive = playerScreenIndex === scr;
        const analyzed = renderResults.some(r => r.screenIndex === scr);
        const scrResult = renderResults.find(r => r.screenIndex === scr);
        return (
          <Box key={scr} style={{
            position: 'absolute', left: EDGE_PAD + col * (cellW + GAP), top: EDGE_PAD + row * (cellH + GAP),
            width: cellW, height: cellH, borderRadius: 'var(--radius-sm)', fontSize: 10, textAlign: 'center',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            background: isActive ? 'var(--c-secondary-soft)' : analyzed ? 'var(--c-info-soft)' : 'var(--c-hover)',
            border: `1px solid ${isActive ? 'var(--c-secondary-soft)' : analyzed ? 'var(--c-info-soft)' : 'var(--c-border)'}`,
            color: isActive ? 'var(--c-secondary-bright)' : analyzed ? 'var(--c-info)' : 'var(--c-text-muted)', overflow: 'hidden',
          }}>
            {scrResult && <ReachabilityCanvas reachable={scrResult.reachable} size={cellW} tileLayer={scrResult.tileLayer} />}
            <Box style={IL.cellName}>{bundle.subNames[scr] || bundle.screenNames[scr]}</Box>
            <Box style={IL.cellHex}>0x{scr.toString(16).toUpperCase()}</Box>
            {scrResult && <Box style={IL.cellCount}>{scrResult.reachableCount}/{scrResult.totalTiles}</Box>}
          </Box>
        );
      })}

      {crossings.flatMap(screen => markerCrossings(screen, false).map(crossing => {
        const scrIdx = bundle.screens.indexOf(screen.screenIndex);
        if (scrIdx < 0) return null;
        const cellCol = scrIdx % bundle.cols;
        const cellRow = Math.floor(scrIdx / bundle.cols);
        const cellLeft = EDGE_PAD + cellCol * (cellW + GAP);
        const cellTop = EDGE_PAD + cellRow * (cellH + GAP);
        const localX = (crossing.tile.col / 64) * cellW;
        const localY = (crossing.tile.row / 64) * cellH;
        const sz = Math.max(6, cellW * 4 / 64);
        const { icon: markerIcon, color: markerColor } = crossingIcon(crossing);
        return (
          <Box key={`ent-${screen.screenIndex}-${crossing.id}`} style={{ position: 'absolute', left: cellLeft + localX - sz / 2, top: cellTop + localY - sz / 2, width: sz, height: sz, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={crossing.label}>
            <Icon icon={markerIcon} width={sz} height={sz} style={{ color: markerColor, filter: 'drop-shadow(0 0 1px #000)' }} />
          </Box>
        );
      }))}

      {playerPos && bundle.screens.includes(playerPos.screen) && (() => {
        const scrIdx = bundle.screens.indexOf(playerPos.screen);
        const col = scrIdx % bundle.cols;
        const row = Math.floor(scrIdx / bundle.cols);
        const cellLeft = EDGE_PAD + col * (cellW + GAP);
        const cellTop = EDGE_PAD + row * (cellH + GAP);
        const x = (playerPos.col / 64) * cellW;
        const y = (playerPos.row / 64) * cellH;
        return <Box style={{ position: 'absolute', left: cellLeft + x - 3, top: cellTop + y - 3, width: 6, height: 6, borderRadius: '50%', background: 'var(--c-secondary)', boxShadow: '0 0 3px var(--c-secondary)', pointerEvents: 'none' }} />;
      })()}

      {annotations.map((set) => {
        const scrIdx = bundle.screens.indexOf(set.screenIndex);
        if (scrIdx < 0) return null;
        const cellLeft = EDGE_PAD + (scrIdx % bundle.cols) * (cellW + GAP);
        const cellTop = EDGE_PAD + Math.floor(scrIdx / bundle.cols) * (cellH + GAP);
        return (
          <AnnotationLayer
            key={`anno-set-${set.screenIndex}`}
            annotations={set}
            cellLeft={cellLeft}
            cellTop={cellTop}
            cellW={cellW}
            cellH={cellH}
          />
        );
      })}

      {renderHorizEdge(byEdge.north, 'n', EDGE_PAD - 15)}
      {renderHorizEdge(byEdge.south, 's', EDGE_PAD + gridH + 1)}
      {renderVertEdge(byEdge.west, 'w', EDGE_PAD - 15)}
      {renderVertEdge(byEdge.east, 'e', EDGE_PAD + gridW + 1)}
    </Box>
  );
};

export { OverworldMinimap };
