import { Icon } from '@iconify/react/offline';
import type { ConnectionInfo } from '@shared/game/navigation';
import { getEntranceIcon } from '../../../lib/entrance-icons';
import { useNavigationOverlayStore } from '../../../stores/navigation-overlay-store';
import { EDGE_COLORS } from '../constants';
import { getScreenDisplayName } from '../widget-helpers';
import { ReachabilityCanvas } from './ReachabilityCanvas';
import type { MinimapProps } from './IndoorMinimap';

/** Overworld minimap: a multi-cell grid (one cell per 512×512 screen). */
const OverworldMinimap = ({ bundle, connections, renderResults, linkScreenIndex, linkPos, respawnEntIds, roomIndex }: MinimapProps) => {
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
  const fallHoleSpawns = useNavigationOverlayStore(s => s.fallHoleSpawns);

  const byEdge: Record<string, ConnectionInfo[]> = { north: [], south: [], east: [], west: [] };
  for (const c of externalConns) {
    if (byEdge[c.edge]) byEdge[c.edge].push(c);
  }

  const textColor = (edge: string) => (edge === 'north' || edge === 'west' ? '#fff' : '#000');

  const renderHorizEdge = (list: ConnectionInfo[], prefix: string, top: number) => list.map((c, i) => {
    const scrIdx = bundle.screens.indexOf(c.sourceScreen!);
    const col = scrIdx >= 0 ? scrIdx % bundle.cols : 0;
    const colStart = EDGE_PAD + col * (cellW + GAP);
    const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
    const x0 = (p0 / 64) * cellW;
    const spanW = Math.max(14, ((p1 - p0 + 1) / 64) * cellW);
    return (
      <div key={`${prefix}${i}`} style={{ position: 'absolute', top, left: colStart + x0, width: spanW, height: 14, borderRadius: 2, background: EDGE_COLORS[c.edge], display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={`${getScreenDisplayName(c.targetScreen)} c${p0}-${p1} (${c.positions.length})`}>
        <span style={{ fontSize: 9, fontWeight: 700, color: textColor(c.edge), lineHeight: 1 }}>{c.positions.length}</span>
      </div>
    );
  });

  const renderVertEdge = (list: ConnectionInfo[], prefix: string, left: number) => list.map((c, i) => {
    const scrIdx = bundle.screens.indexOf(c.sourceScreen!);
    const row = scrIdx >= 0 ? Math.floor(scrIdx / bundle.cols) : 0;
    const rowStart = EDGE_PAD + row * (cellH + GAP);
    const p0 = c.positions[0], p1 = c.positions[c.positions.length - 1];
    const y0 = (p0 / 64) * cellH;
    const spanH = Math.max(14, ((p1 - p0 + 1) / 64) * cellH);
    return (
      <div key={`${prefix}${i}`} style={{ position: 'absolute', left, top: rowStart + y0, width: 14, height: spanH, borderRadius: 2, background: EDGE_COLORS[c.edge], display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={`${getScreenDisplayName(c.targetScreen)} r${p0}-${p1} (${c.positions.length})`}>
        <span style={{ fontSize: 9, fontWeight: 700, color: textColor(c.edge), lineHeight: 1 }}>{c.positions.length}</span>
      </div>
    );
  });

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: totalW, height: totalH, marginTop: 4, marginLeft: 'auto', marginRight: 'auto' }}>
      {bundle.screens.map((scr, idx) => {
        const col = idx % bundle.cols;
        const row = Math.floor(idx / bundle.cols);
        const isActive = linkScreenIndex === scr;
        const analyzed = renderResults.some(r => r.screenIndex === scr);
        const scrResult = renderResults.find(r => r.screenIndex === scr);
        return (
          <div key={scr} style={{
            position: 'absolute', left: EDGE_PAD + col * (cellW + GAP), top: EDGE_PAD + row * (cellH + GAP),
            width: cellW, height: cellH, borderRadius: 3, fontSize: 10, textAlign: 'center',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            background: isActive ? 'rgba(100,255,100,0.12)' : analyzed ? 'rgba(100,200,255,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isActive ? 'rgba(100,255,100,0.5)' : analyzed ? 'rgba(100,200,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: isActive ? '#8f8' : analyzed ? '#8cf' : '#666', overflow: 'hidden',
          }}>
            {scrResult && <ReachabilityCanvas reachable={scrResult.reachable} size={cellW} tileLayer={scrResult.tileLayer} />}
            <div style={{ fontWeight: 700, fontSize: 11, position: 'relative' }}>{bundle.subNames[scr] || bundle.screenNames[scr]}</div>
            <div style={{ color: '#555', fontSize: 9, position: 'relative' }}>0x{scr.toString(16).toUpperCase()}</div>
            {scrResult && <div style={{ fontSize: 9, color: '#999', position: 'relative' }}>{scrResult.reachableCount}/{scrResult.totalTiles}</div>}
          </div>
        );
      })}

      {renderResults.flatMap(r => r.entrances.filter(e => r.transitions.some(t => t.entranceIdx === e.id)).map(ent => {
        const scrIdx = bundle.screens.indexOf(r.screenIndex);
        if (scrIdx < 0) return null;
        const cellCol = scrIdx % bundle.cols;
        const cellRow = Math.floor(scrIdx / bundle.cols);
        const cellLeft = EDGE_PAD + cellCol * (cellW + GAP);
        const cellTop = EDGE_PAD + cellRow * (cellH + GAP);
        const localX = (ent.gridCol / 64) * cellW;
        const localY = (ent.gridRow / 64) * cellH;
        const sz = Math.max(6, cellW * 4 / 64);
        const { icon: markerIcon, color: markerColor } = getEntranceIcon(ent.id, ent.roomId, roomIndex, false, respawnEntIds);
        return (
          <div key={`ent-${r.screenIndex}-${ent.id}`} style={{ position: 'absolute', left: cellLeft + localX - sz / 2, top: cellTop + localY - sz / 2, width: sz, height: sz, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={markerIcon} width={sz} height={sz} style={{ color: markerColor, filter: 'drop-shadow(0 0 1px #000)' }} />
          </div>
        );
      }))}

      {fallHoleSpawns.map((fh, i) => {
        const localX = (fh.gridCol / 64) * cellW;
        const localY = (fh.gridRow / 64) * cellH;
        const sz = Math.max(6, cellW * 4 / 64);
        return (
          <div key={`fh-${i}`} style={{ position: 'absolute', left: EDGE_PAD + localX - sz / 2, top: EDGE_PAD + localY - sz / 2, width: sz, height: sz, border: '1.5px solid #ffcc44', borderRadius: 1, pointerEvents: 'none', background: 'repeating-linear-gradient(45deg, #ffcc44 0px, #ffcc44 2px, transparent 2px, transparent 4px)', opacity: 0.8 }} />
        );
      })}

      {linkPos && bundle.screens.includes(linkPos.screen) && (() => {
        const scrIdx = bundle.screens.indexOf(linkPos.screen);
        const col = scrIdx % bundle.cols;
        const row = Math.floor(scrIdx / bundle.cols);
        const cellLeft = EDGE_PAD + col * (cellW + GAP);
        const cellTop = EDGE_PAD + row * (cellH + GAP);
        const x = (linkPos.col / 64) * cellW;
        const y = (linkPos.row / 64) * cellH;
        return <div style={{ position: 'absolute', left: cellLeft + x - 3, top: cellTop + y - 3, width: 6, height: 6, borderRadius: '50%', background: '#4f8', boxShadow: '0 0 3px #4f8', pointerEvents: 'none' }} />;
      })()}

      {renderHorizEdge(byEdge.north, 'n', EDGE_PAD - 15)}
      {renderHorizEdge(byEdge.south, 's', EDGE_PAD + gridH + 1)}
      {renderVertEdge(byEdge.west, 'w', EDGE_PAD - 15)}
      {renderVertEdge(byEdge.east, 'e', EDGE_PAD + gridW + 1)}
    </div>
  );
};

export { OverworldMinimap };
