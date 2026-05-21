import { useRef, useEffect, useState, useCallback } from 'react';
import { useConnectionOverlayStore } from '../../../../stores/connection-overlay-store';
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { wasmGetViewportInfo } from '../../../../lib/game';

const EDGE_COLORS: Record<string, string> = {
  north: '#4488ff',
  south: '#44ff88',
  east: '#ff8844',
  west: '#bb44ff',
  entrance: '#ffcc44',
};

interface Props {
  width: number;
  height: number;
  gameRunning: boolean;
}

/**
 * 2D canvas overlay that draws flood-fill dots at world positions,
 * properly aligned with the game viewport using camera scroll data.
 */
function ConnectionOverlay({ width, height, gameRunning }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const { visible, result, connections } = useConnectionOverlayStore();
  const { overworldScreenIndex } = useGameUIStore(s => s.map);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible || !result || !gameRunning) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      cancelAnimationFrame(rafRef.current);
      return;
    }

    if (result.screenIndex !== overworldScreenIndex) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const vp = wasmGetViewportInfo();
      if (!vp || vp.locationModule !== 9) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Camera position: BG2HOFS/VOFS gives the left edge of the BASE 256px viewport.
      // With extended aspect ratio, the rendered area extends extraLeftRight to the left.
      // So the leftmost visible world pixel = camX - extraLeftRight.
      const camX = vp.cameraX;
      const camY = vp.cameraY;

      // The full rendered SNES area
      const snesW = vp.snesWidth;   // 256 + 2*extraLeftRight
      const snesH = vp.snesHeight;  // 224 or 240

      // Left edge of visible world area
      const viewLeft = camX - vp.extraLeftRight;
      const viewTop = camY;

      // Scale from SNES pixels to display pixels
      const scaleX = width / snesW;
      const scaleY = height / snesH;

      // The screen's world origin in game pixels (each screen = 64 sub-tiles × 8px = 512px)
      const screenCol = overworldScreenIndex & 7;
      const screenRow = (overworldScreenIndex >> 3) & 7;
      const screenWorldX = screenCol * 512;
      const screenWorldY = screenRow * 512;

      // Sub-tile size in game pixels
      const TILE_PX = 8;
      // Dot radius in display pixels
      const dotRadius = Math.max(2.5, 4 * Math.min(scaleX, scaleY));

      // Draw reachable tiles as dots (skip ledge tiles — those get arrows instead)
      const LEDGE_ATTRS = new Set([0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x01, 0x02, 0x03, 0x1a, 0x12]);
      ctx.globalAlpha = 0.55;
      for (let r = 0; r < 64; r++) {
        for (let c = 0; c < 64; c++) {
          if (!result.reachable[r][c]) continue;
          if (result.attrGrid && LEDGE_ATTRS.has(result.attrGrid[r][c])) continue;

          // Tile center in world coordinates
          const worldX = screenWorldX + c * TILE_PX + TILE_PX / 2;
          const worldY = screenWorldY + r * TILE_PX + TILE_PX / 2;

          // Convert to position within the rendered SNES frame
          const screenX = worldX - viewLeft;
          const screenY = worldY - viewTop;

          // Cull tiles outside viewport
          if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
          if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

          // Convert to display pixels
          const dx = screenX * scaleX;
          const dy = screenY * scaleY;

          // Pink fill for tiles that require any item, cyan for free tiles
          const hasReq = result.reqGrid && result.reqGrid[r][c] !== '';

          if (hasReq) {
            ctx.fillStyle = 'rgba(255, 100, 180, 0.7)';
          } else {
            ctx.fillStyle = 'rgba(80, 200, 255, 0.6)';
          }
          ctx.beginPath();
          ctx.arc(dx, dy, dotRadius * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw cliff jump arrows as continuous lines from start to end
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = '#cc5555';
      ctx.fillStyle = '#cc5555';
      for (const ledge of result.ledges ?? []) {
        // Start position (center of trigger tile)
        const startWorldX = screenWorldX + ledge.startCol * TILE_PX + TILE_PX / 2;
        const startWorldY = screenWorldY + ledge.startRow * TILE_PX + TILE_PX / 2;
        // End position (center of landing tile)
        const endWorldX = screenWorldX + ledge.endCol * TILE_PX + TILE_PX / 2;
        const endWorldY = screenWorldY + ledge.endRow * TILE_PX + TILE_PX / 2;

        const startSX = startWorldX - viewLeft;
        const startSY = startWorldY - viewTop;
        const endSX = endWorldX - viewLeft;
        const endSY = endWorldY - viewTop;

        // Cull if both endpoints are off-screen
        if (startSX < -TILE_PX && endSX < -TILE_PX) continue;
        if (startSX > snesW + TILE_PX && endSX > snesW + TILE_PX) continue;
        if (startSY < -TILE_PX && endSY < -TILE_PX) continue;
        if (startSY > snesH + TILE_PX && endSY > snesH + TILE_PX) continue;

        const x1 = startSX * scaleX;
        const y1 = startSY * scaleY;
        const x2 = endSX * scaleX;
        const y2 = endSY * scaleY;

        // Arrow shaft
        ctx.lineWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Arrowhead at end
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = TILE_PX * Math.min(scaleX, scaleY) * 0.6;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
        ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();
      }

      // Draw connection border tiles as larger colored dots
      ctx.globalAlpha = 0.85;
      for (const conn of connections) {
        ctx.fillStyle = EDGE_COLORS[conn.edge] ?? '#fff';
        for (const pos of conn.positions) {
          let r: number, c: number;
          switch (conn.edge) {
            case 'north': r = 0; c = pos; break;
            case 'south': r = 63; c = pos; break;
            case 'east': r = pos; c = 63; break;
            case 'west': r = pos; c = 0; break;
            default: continue;
          }

          const worldX = screenWorldX + c * TILE_PX + TILE_PX / 2;
          const worldY = screenWorldY + r * TILE_PX + TILE_PX / 2;
          const screenX = worldX - viewLeft;
          const screenY = worldY - viewTop;
          if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
          if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

          const dx = screenX * scaleX;
          const dy = screenY * scaleY;
          ctx.beginPath();
          ctx.arc(dx, dy, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw entrance markers as larger golden dots
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = EDGE_COLORS.entrance;
      for (const ent of result.entrances) {
        const worldX = screenWorldX + ent.gridCol * TILE_PX + TILE_PX / 2;
        const worldY = screenWorldY + ent.gridRow * TILE_PX + TILE_PX / 2;
        const screenX = worldX - viewLeft;
        const screenY = worldY - viewTop;
        if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
        if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

        const dx = screenX * scaleX;
        const dy = screenY * scaleY;
        ctx.beginPath();
        ctx.arc(dx, dy, dotRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, result, connections, width, height, gameRunning, overworldScreenIndex]);

  if (!visible || !result) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width,
          height,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
      {result.attrGrid && (
        <TileInspector
          width={width}
          height={height}
          result={result}
          overworldScreenIndex={overworldScreenIndex}
        />
      )}
    </>
  );
}

/** Transparent overlay for inspecting tile attributes on hover */
function TileInspector({ width, height, result, overworldScreenIndex }: {
  width: number; height: number;
  result: NonNullable<ReturnType<typeof useConnectionOverlayStore.getState>['result']>;
  overworldScreenIndex: number;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const vpRef = useRef<ReturnType<typeof wasmGetViewportInfo>>(null);

  // Keep viewport info fresh
  useEffect(() => {
    let raf = 0;
    const update = () => { vpRef.current = wasmGetViewportInfo(); raf = requestAnimationFrame(update); };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const vp = vpRef.current;
    if (!vp || !result.attrGrid) { setTooltip(null); return; }

    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const snesW = vp.snesWidth;
    const snesH = vp.snesHeight;
    const scaleX = width / snesW;
    const scaleY = height / snesH;

    // Convert display coords to SNES coords
    const snesX = mx / scaleX;
    const snesY = my / scaleY;

    // Convert to world coords
    const viewLeft = vp.cameraX - vp.extraLeftRight;
    const viewTop = vp.cameraY;
    const worldX = snesX + viewLeft;
    const worldY = snesY + viewTop;

    // Convert to grid position within this screen
    const screenCol = overworldScreenIndex & 7;
    const screenRow = (overworldScreenIndex >> 3) & 7;
    const screenWorldX = screenCol * 512;
    const screenWorldY = screenRow * 512;

    const tileCol = Math.floor((worldX - screenWorldX) / 8);
    const tileRow = Math.floor((worldY - screenWorldY) / 8);

    if (tileRow < 0 || tileRow >= 64 || tileCol < 0 || tileCol >= 64) {
      setTooltip(null);
      return;
    }

    const attr = result.attrGrid[tileRow][tileCol];
    const reachable = result.reachable[tileRow][tileCol];
    setTooltip({
      x: mx,
      y: my,
      text: `[${tileRow},${tileCol}] attr=0x${attr.toString(16).padStart(2, '0')} ${reachable ? '✓' : '✗'}`,
    });
  }, [width, height, result, overworldScreenIndex]);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip(null)}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width,
        height,
        zIndex: 6,
      }}
    >
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x + 12,
          top: tooltip.y - 24,
          background: 'rgba(0,0,0,0.85)',
          color: '#0f0',
          fontFamily: 'monospace',
          fontSize: 12,
          padding: '2px 6px',
          borderRadius: 3,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

export { ConnectionOverlay };
