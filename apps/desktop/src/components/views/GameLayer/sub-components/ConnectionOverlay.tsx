import { useRef, useEffect, useState, useCallback } from 'react';
import { useConnectionOverlayStore } from '../../../../stores/connection-overlay-store';
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { wasmGetViewportInfo, wasmGetLiveSprites } from '../../../../lib/game';
import { classifyTileAttr } from '@shared/game/navigation/tile-classification';
import { getTileAttrsMap, getAttrLabel } from '@shared/game/navigation/tile-attrs';

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

type GridPos = { row: number; col: number };
type Rect = { x: number; y: number; w: number; h: number };

const PATH_DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function manhattan(a: GridPos, b: GridPos): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function keyOf(pos: GridPos): string {
  return `${pos.row},${pos.col}`;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function segmentOverlapsRect(a: { x: number; y: number }, b: { x: number; y: number }, rect: Rect, margin: number): boolean {
  const minX = rect.x - margin;
  const maxX = rect.x + rect.w + margin;
  const minY = rect.y - margin;
  const maxY = rect.y + rect.h + margin;

  if (Math.abs(a.y - b.y) < 0.001) {
    // Horizontal segment
    const y = a.y;
    if (y < minY || y > maxY) return false;
    const sx1 = Math.min(a.x, b.x);
    const sx2 = Math.max(a.x, b.x);
    return sx2 >= minX && sx1 <= maxX;
  }

  if (Math.abs(a.x - b.x) < 0.001) {
    // Vertical segment
    const x = a.x;
    if (x < minX || x > maxX) return false;
    const sy1 = Math.min(a.y, b.y);
    const sy2 = Math.max(a.y, b.y);
    return sy2 >= minY && sy1 <= maxY;
  }

  return false;
}

/** Check whether a 2×2 block (top-left at row,col) is fully reachable. */
function isValid2x2(row: number, col: number, reachable: boolean[][]): boolean {
  if (row < 0 || row + 1 >= 64 || col < 0 || col + 1 >= 64) return false;
  return reachable[row][col] && reachable[row][col + 1] &&
         reachable[row + 1][col] && reachable[row + 1][col + 1];
}

/**
 * Snap a cursor tile to the nearest valid 2×2 top-left corner.
 * Checks the 4 squares that contain the cursor tile first, then spirals out.
 */
function findNearest2x2Goal(cursorRow: number, cursorCol: number, reachable: boolean[][]): GridPos | null {
  // 4 squares whose footprint includes (cursorRow, cursorCol)
  const seeds: GridPos[] = [
    { row: cursorRow, col: cursorCol },
    { row: cursorRow - 1, col: cursorCol },
    { row: cursorRow, col: cursorCol - 1 },
    { row: cursorRow - 1, col: cursorCol - 1 },
  ];
  for (const s of seeds) {
    if (isValid2x2(s.row, s.col, reachable)) return s;
  }
  for (let radius = 1; radius <= 8; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue;
        const pos = { row: cursorRow + dr, col: cursorCol + dc };
        if (isValid2x2(pos.row, pos.col, reachable)) return pos;
      }
    }
  }
  return null;
}

/** A* where each node is the top-left of a 2×2 block — all 4 tiles must be reachable at every step. */
function findPath2x2AStar(start: GridPos, goal: GridPos, reachable: boolean[][]): GridPos[] | null {
  if (!isValid2x2(start.row, start.col, reachable) || !isValid2x2(goal.row, goal.col, reachable)) return null;

  const open: GridPos[] = [start];
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[keyOf(start), 0]]);
  const fScore = new Map<string, number>([[keyOf(start), manhattan(start, goal)]]);
  const closed = new Set<string>();

  while (open.length > 0) {
    let bestIdx = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let i = 0; i < open.length; i++) {
      const s = fScore.get(keyOf(open[i])) ?? Number.POSITIVE_INFINITY;
      if (s < bestScore) { bestScore = s; bestIdx = i; }
    }

    const current = open.splice(bestIdx, 1)[0];
    const currentKey = keyOf(current);
    if (current.row === goal.row && current.col === goal.col) {
      const path: GridPos[] = [current];
      let walk = currentKey;
      while (cameFrom.has(walk)) {
        const prev = cameFrom.get(walk)!;
        const [r, c] = prev.split(',').map(Number);
        path.push({ row: r, col: c });
        walk = prev;
      }
      path.reverse();
      return path;
    }

    closed.add(currentKey);

    for (const [dr, dc] of PATH_DIRS) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      if (!isValid2x2(nr, nc, reachable)) continue;

      const nextKey = `${nr},${nc}`;
      if (closed.has(nextKey)) continue;

      const tentativeG = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + 1;
      if (tentativeG >= (gScore.get(nextKey) ?? Number.POSITIVE_INFINITY)) continue;

      cameFrom.set(nextKey, currentKey);
      gScore.set(nextKey, tentativeG);
      fScore.set(nextKey, tentativeG + manhattan({ row: nr, col: nc }, goal));
      if (!open.some(p => p.row === nr && p.col === nc)) open.push({ row: nr, col: nc });
    }
  }
  return null;
}

/**
 * Find a 2×2 path from Link to goal.
 * Snaps Link's top-left to the nearest valid 2×2 start position.
 */
function findPath2x2FromLink(
  linkX: number, linkY: number,
  screenWorldX: number, screenWorldY: number,
  goal: GridPos,
  reachable: boolean[][],
): GridPos[] | null {
  const startRow = Math.floor((linkY - screenWorldY) / 8);
  const startCol = Math.floor((linkX - screenWorldX) / 8);
  // Prefer Link's own top-left first, fall back to nearest valid 2×2
  const start = isValid2x2(startRow, startCol, reachable)
    ? { row: startRow, col: startCol }
    : findNearest2x2Goal(startRow, startCol, reachable);
  if (!start) return null;
  return findPath2x2AStar(start, goal, reachable);
}

/**
 * 2D canvas overlay that draws flood-fill dots at world positions,
 * properly aligned with the game viewport using camera scroll data.
 */

function ConnectionOverlay({ width, height, gameRunning }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const { visible, result, results, connections } = useConnectionOverlayStore();
  const { overworldScreenIndex, roomIndex, isIndoors } = useGameUIStore(s => s.map);
  const activeScreenIndex = isIndoors ? roomIndex : overworldScreenIndex;

  // Mouse/path state
  const [mouseState, setMouseState] = useState({
    leftHeld: false,
    lockTarget: false,
    hoverTile: null as { row: number; col: number } | null,
    lockedTile: null as { row: number; col: number } | null,
  });
  const mouseStateRef = useRef(mouseState);

  useEffect(() => {
    mouseStateRef.current = mouseState;
  }, [mouseState]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      // New left-click clears any existing lock so the user can start fresh
      setMouseState(s => s.lockTarget ? { ...s, leftHeld: true, lockTarget: false, lockedTile: null } : { ...s, leftHeld: true });
    }
    if (e.button === 2) {
      // Lock target on right click while holding left
      setMouseState(s => (s.leftHeld && s.hoverTile)
        ? { ...s, lockTarget: true, lockedTile: s.hoverTile }
        : s);
    }
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      // If a lock is active, just release leftHeld — keep locked target visible
      setMouseState(s => s.lockTarget
        ? { ...s, leftHeld: false }
        : { ...s, leftHeld: false, lockedTile: null });
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent default context menu
    e.preventDefault();
  }, []);

  // Track hover tile from TileInspector
  const handleHoverTile = useCallback((row: number, col: number) => {
    setMouseState(s => ({
      ...s,
      hoverTile: row >= 0 && col >= 0 ? { row, col } : null,
    }));
  }, []);

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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const vp = wasmGetViewportInfo();
      if (!vp || !vp.isGameplay) {
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
      const screenWorldX = isIndoors
        ? (Math.floor(vp.linkX / 512) * 512)
        : ((result.screenIndex & 7) * 512);
      const screenWorldY = isIndoors
        ? (Math.floor(vp.linkY / 512) * 512)
        : (((result.screenIndex >> 3) & 7) * 512);
      const drawResults = results.length > 0 ? results : [result];
      const getScreenWorldOrigin = (screenIndex: number) => ({
        x: isIndoors ? (Math.floor(vp.linkX / 512) * 512) : ((screenIndex & 7) * 512),
        y: isIndoors ? (Math.floor(vp.linkY / 512) * 512) : (((screenIndex >> 3) & 7) * 512),
      });

      // Sub-tile size in game pixels
      const TILE_PX = 8;
      // Dot radius in display pixels
      const dotRadius = Math.max(2.5, 4 * Math.min(scaleX, scaleY));

      // Draw reachable tiles as dots (skip ledge tiles — those get arrows instead)
      const LEDGE_ATTRS = new Set([0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x01, 0x02, 0x03, 0x1a, 0x12]);
      ctx.globalAlpha = 0.55;
      for (const drawResult of drawResults) {
        const origin = getScreenWorldOrigin(drawResult.screenIndex);
        for (let r = 0; r < 64; r++) {
          for (let c = 0; c < 64; c++) {
            if (!drawResult.reachable[r][c]) continue;
            if (drawResult.attrGrid && LEDGE_ATTRS.has(drawResult.attrGrid[r][c])) continue;

            // Tile center in world coordinates
            const worldX = origin.x + c * TILE_PX + TILE_PX / 2;
            const worldY = origin.y + r * TILE_PX + TILE_PX / 2;

            // Convert to position within the rendered SNES frame
            const screenX = worldX - viewLeft;
            const screenY = worldY - viewTop;

            // Cull tiles outside viewport
            if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
            if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

            // Convert to display pixels
            const dx = screenX * scaleX;
            const dy = screenY * scaleY;

            // Pink = requires ANY item (including lift.1 — DO NOT remove lift.1 from this check, it IS a real requirement)
            // Cyan = completely free, no items needed
            const hasReq = drawResult.reqGrid && drawResult.reqGrid[r][c] !== '';

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
      }

      // Draw flood fill starting position as a black dot with white outline
      if (result.startPos) {
        const spWorldX = screenWorldX + result.startPos.col * TILE_PX + TILE_PX / 2;
        const spWorldY = screenWorldY + result.startPos.row * TILE_PX + TILE_PX / 2;
        const spSX = (spWorldX - viewLeft) * scaleX;
        const spSY = (spWorldY - viewTop) * scaleY;
        const spR = Math.max(4, dotRadius * 1.1);
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(spSX, spSY, spR + 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(spSX, spSY, spR, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
      }

      // Draw hookshot targets: same-colored dot with a bright green ring border
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = Math.max(1.5, 2.5 * Math.min(scaleX, scaleY));
      ctx.strokeStyle = '#00ff88';
      for (const drawResult of drawResults) {
        if (!drawResult.hookTargets || drawResult.hookTargets.length === 0) continue;
        const origin = getScreenWorldOrigin(drawResult.screenIndex);
        for (const ht of drawResult.hookTargets) {
          const worldX = origin.x + ht.col * TILE_PX + TILE_PX / 2;
          const worldY = origin.y + ht.row * TILE_PX + TILE_PX / 2;
          const screenX = worldX - viewLeft;
          const screenY = worldY - viewTop;
          if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
          if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

          const dx = screenX * scaleX;
          const dy = screenY * scaleY;

          const hasReq = drawResult.reqGrid && drawResult.reqGrid[ht.row]?.[ht.col] !== '';
          ctx.fillStyle = hasReq
            ? 'rgba(255, 100, 180, 0.7)'
            : 'rgba(80, 200, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(dx, dy, dotRadius * 0.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(dx, dy, dotRadius * 0.9, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw live debug path while holding left mouse:
      // start = Link tile, end = hovered tile (or locked tile after right-click)
      const ms = mouseStateRef.current;
      // Show path when: left is held (live preview), OR when target is locked (persists after release)
      const activeTarget = ms.lockTarget && ms.lockedTile
        ? ms.lockedTile
        : ms.leftHeld ? ms.hoverTile : null;

      if (activeTarget) {
        // Snap cursor tile to nearest valid 2×2 top-left corner
        const goal2x2 = findNearest2x2Goal(activeTarget.row, activeTarget.col, result.reachable);
        const path = goal2x2
          ? findPath2x2FromLink(vp.linkX, vp.linkY, screenWorldX, screenWorldY, goal2x2, result.reachable)
          : null;

        // Draw target 2×2 rectangle border regardless of path availability
        if (goal2x2) {
          const rectWX = screenWorldX + goal2x2.col * TILE_PX;
          const rectWY = screenWorldY + goal2x2.row * TILE_PX;
          const rectX = (rectWX - viewLeft) * scaleX;
          const rectY = (rectWY - viewTop) * scaleY;
          const rectW = TILE_PX * 2 * scaleX;
          const rectH = TILE_PX * 2 * scaleY;
          const targetReq2 = result.reqGrid?.[goal2x2.row]?.[goal2x2.col] ?? '';
          const targetColor = targetReq2 !== '' ? 'rgba(255, 100, 180, 0.95)' : 'rgba(80, 200, 255, 0.95)';
          ctx.save();
          ctx.globalAlpha = 1.0;
          ctx.strokeStyle = targetColor;
          ctx.lineWidth = Math.max(1.5, 2.0 * Math.min(scaleX, scaleY));
          ctx.setLineDash([]);
          ctx.strokeRect(rectX, rectY, rectW, rectH);
          ctx.restore();
        }

        if (path && path.length > 1) {
          const targetReq = goal2x2 ? (result.reqGrid?.[goal2x2.row]?.[goal2x2.col] ?? '') : '';
          const needsItem = targetReq !== '';
          const lineColor = needsItem ? 'rgba(255, 100, 180, 0.95)' : 'rgba(80, 200, 255, 0.95)';

          // Path points are the CENTER of each 2×2 block (+1 tile offset from top-left)
          const points: Array<{ x: number; y: number }> = [];
          for (const p of path) {
            const worldX = screenWorldX + p.col * TILE_PX + TILE_PX; // center of 2×2
            const worldY = screenWorldY + p.row * TILE_PX + TILE_PX;
            const sx = (worldX - viewLeft) * scaleX;
            const sy = (worldY - viewTop) * scaleY;
            points.push({ x: sx, y: sy });
          }

          const now = performance.now();
          // One dash period = dash(8) + gap(5) = 13px; animate at 50px/s forward
          const dashOffset = -((now * 0.05) % 13);

          ctx.save();
          ctx.globalAlpha = 0.9;
          ctx.strokeStyle = lineColor;
          // Thin indicator line — just enough to show the route clearly
          ctx.lineWidth = Math.max(2, 3.5 * Math.min(scaleX, scaleY));
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.setLineDash([8, 5]);
          ctx.lineDashOffset = dashOffset;

          // Smooth bezier path: straight to midpoint before each corner,
          // quadratic curve with the corner as control point to midpoint after.
          // This eliminates the dash pileup and overlap at sharp 90° turns.
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length - 1; i++) {
            const m1x = (points[i - 1].x + points[i].x) / 2;
            const m1y = (points[i - 1].y + points[i].y) / 2;
            const m2x = (points[i].x + points[i + 1].x) / 2;
            const m2y = (points[i].y + points[i + 1].y) / 2;
            ctx.lineTo(m1x, m1y);
            ctx.quadraticCurveTo(points[i].x, points[i].y, m2x, m2y);
          }
          ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
          ctx.stroke();

          ctx.restore();
        }
      }

      // Draw cliff jump arrows as continuous lines from start to end
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = '#cc5555';
      ctx.fillStyle = '#cc5555';
      for (const drawResult of drawResults) {
        const origin = getScreenWorldOrigin(drawResult.screenIndex);
        for (const ledge of drawResult.ledges ?? []) {
        // Start position (center of trigger tile)
        const startWorldX = origin.x + ledge.startCol * TILE_PX + TILE_PX / 2;
        const startWorldY = origin.y + ledge.startRow * TILE_PX + TILE_PX / 2;
        // End position (center of landing tile)
        const endWorldX = origin.x + ledge.endCol * TILE_PX + TILE_PX / 2;
        const endWorldY = origin.y + ledge.endRow * TILE_PX + TILE_PX / 2;

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

      // Draw entrance markers as 2×2 tile rectangles (16×16px trigger zone)
      // The game checks link_x_coord >> 3 (Link's LEFT edge) against the entrance pos.
      // Shift +8px in X to center the marker on Link's visual CENTER when entering,
      // which aligns with the visible door graphic (doors span 2 Map16 tiles).
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = EDGE_COLORS.entrance;
      for (const drawResult of drawResults) {
        const origin = getScreenWorldOrigin(drawResult.screenIndex);
        for (const ent of drawResult.entrances) {
        // Entrance trigger is a single Map16 tile = 2×2 sub-tiles (16×16 game px)
        const worldX = origin.x + ent.gridCol * TILE_PX + 8;
        const worldY = origin.y + ent.gridRow * TILE_PX;
        const screenX = worldX - viewLeft;
        const screenY = worldY - viewTop;
        if (screenX < -TILE_PX * 2 || screenX > snesW + TILE_PX) continue;
        if (screenY < -TILE_PX * 2 || screenY > snesH + TILE_PX) continue;

        const dx = screenX * scaleX;
        const dy = screenY * scaleY;
        const dw = TILE_PX * 2 * scaleX;
        const dh = TILE_PX * 2 * scaleY;

        ctx.globalAlpha = 0.4;
        ctx.fillRect(dx, dy, dw, dh);
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = '#ffcc44';
        ctx.lineWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));
        ctx.strokeRect(dx, dy, dw, dh);
        // White outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(dx - 0.5, dy - 0.5, dw + 1, dh + 1);
        }
      }

      // ─── Debug: Link's position and tile coverage ───
      ctx.globalAlpha = 1.0;
      const linkWorldX = vp.linkX;
      const linkWorldY = vp.linkY;
      // Link's hitbox in SNES pixels relative to viewport
      const linkSX = (linkWorldX - viewLeft) * scaleX;
      const linkSY = (linkWorldY - viewTop) * scaleY;
      const linkW = 16 * scaleX;
      const linkH = 16 * scaleY;

      // Draw Link's hitbox outline (green)
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(linkSX, linkSY, linkW, linkH);

      // Compute which sub-tiles (8px grid) Link covers
      const linkRelX = linkWorldX - screenWorldX;
      const linkRelY = linkWorldY - screenWorldY;
      const tileMinCol = Math.floor(linkRelX / TILE_PX);
      const tileMaxCol = Math.floor((linkRelX + 15) / TILE_PX);
      const tileMinRow = Math.floor(linkRelY / TILE_PX);
      const tileMaxRow = Math.floor((linkRelY + 15) / TILE_PX);

      // Highlight covered tiles (green outline per tile)
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.lineWidth = 1;
      for (let r = tileMinRow; r <= tileMaxRow; r++) {
        for (let c = tileMinCol; c <= tileMaxCol; c++) {
          const twx = (screenWorldX + c * TILE_PX - viewLeft) * scaleX;
          const twy = (screenWorldY + r * TILE_PX - viewTop) * scaleY;
          ctx.strokeRect(twx, twy, TILE_PX * scaleX, TILE_PX * scaleY);
        }
      }

      // Draw live sprite 16x16 footprints as bright red border-only boxes.
      // This helps inspect blocker spacing versus Link's 2x2 movement footprint.
      const liveSprites = wasmGetLiveSprites();
      if (liveSprites.length > 0) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ff2222';
        ctx.lineWidth = Math.max(1.5, 2.5 * Math.min(scaleX, scaleY));
        for (const s of liveSprites) {
          const worldX = s.x;
          const worldY = s.y;
          const sx = (worldX - viewLeft) * scaleX;
          const sy = (worldY - viewTop) * scaleY;
          const sw = 16 * scaleX;
          const sh = 16 * scaleY;

          if (sx + sw < 0 || sy + sh < 0 || sx > width || sy > height) continue;
          ctx.strokeRect(sx, sy, sw, sh);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, result, results, connections, width, height, gameRunning, activeScreenIndex, isIndoors, overworldScreenIndex]);

  if (!visible || !result) return null;

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 6 }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
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
          roomIndex={roomIndex}
          isIndoors={isIndoors}
          onHoverTile={handleHoverTile}
          pathPreviewState={mouseState}
        />
      )}
      <PathControlsLegend />
      <OverlayLegend />
    </div>
  );
}

function PathControlsLegend() {
  return (
    <div style={{
      position: 'absolute', bottom: 90, right: 6, zIndex: 7,
      background: 'rgba(10,10,20,0.85)', border: '1px solid rgba(100,200,255,0.2)',
      borderRadius: 4, padding: '4px 8px', pointerEvents: 'none',
      fontFamily: 'monospace', fontSize: 10, lineHeight: '15px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <div style={{ color: '#9fd', fontWeight: 700 }}>Path Debug Controls</div>
      <div style={{ color: '#ccc' }}>LMB hold: live A* path to cursor</div>
      <div style={{ color: '#ccc' }}>RMB while holding: lock target</div>
      <div style={{ color: '#ccc' }}>Release LMB: clear lock/path</div>
    </div>
  );
}

/** Compact color legend for the overlay */
function OverlayLegend() {
  return (
    <div style={{
      position: 'absolute', bottom: 6, right: 6, zIndex: 7,
      background: 'rgba(10,10,20,0.85)', border: '1px solid rgba(100,200,255,0.2)',
      borderRadius: 4, padding: '4px 8px', pointerEvents: 'none',
      fontFamily: 'monospace', fontSize: 10, lineHeight: '15px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <LegendItem color="rgba(80,200,255,0.8)" label="reachable (free)" />
      <LegendItem color="rgba(255,100,180,0.8)" label="reachable (needs item)" />
      <LegendItem color="#cc5555" label="cliff jump" isArrow />
      <LegendItem color="rgba(80,200,255,0.8)" border="#00ff88" label="hookshot target" />
    </div>
  );
}

function LegendItem({ color, label, border, isArrow }: { color: string; label: string; border?: string; isArrow?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {isArrow ? (
        <span style={{ color, fontSize: 12 }}>→</span>
      ) : (
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: color,
          border: border ? `2px solid ${border}` : 'none',
          boxSizing: 'border-box', flexShrink: 0,
        }} />
      )}
      <span style={{ color: '#ccc' }}>{label}</span>
    </div>
  );
}

/** Transparent overlay for inspecting tile attributes on hover */
interface TileInspectorProps {
  width: number;
  height: number;
  result: NonNullable<ReturnType<typeof useConnectionOverlayStore.getState>['result']>;
  overworldScreenIndex: number;
  roomIndex: number;
  isIndoors: boolean;
  onHoverTile?: (row: number, col: number) => void;
  pathPreviewState?: {
    leftHeld: boolean;
    lockTarget: boolean;
    hoverTile: GridPos | null;
    lockedTile: GridPos | null;
  };
}

function TileInspector({ width, height, result, overworldScreenIndex, roomIndex: _roomIndex, isIndoors, onHoverTile, pathPreviewState }: TileInspectorProps) {
  const equipment = useGameUIStore(s => s.equipment);
  const inventoryItems = useGameUIStore(s => s.inventory.items);
  const spriteRef = useRef<ReturnType<typeof wasmGetLiveSprites>>([]);
  const [tooltip, setTooltip] = useState<{
    x: number; y: number;
    row: number; col: number;
    attr: number; label: string;
    type: string; req: string | null;
    canPass: boolean | null;
    reachable: boolean;
    hookTarget: boolean;
    /** Accumulated requirements the BFS needed to reach this tile (from reqGrid) */
    pathReqs: string;
    bfsBlocked: boolean;
    spriteInfo: string[];
  } | null>(null);
  const vpRef = useRef<ReturnType<typeof wasmGetViewportInfo>>(null);

  // Keep viewport info fresh
  useEffect(() => {
    let raf = 0;
    const update = () => {
      vpRef.current = wasmGetViewportInfo();
      spriteRef.current = wasmGetLiveSprites();
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const vp = vpRef.current;
    if (!vp || !result.attrGrid) {
      setTooltip(null);
      if (onHoverTile) onHoverTile(-1, -1);
      return;
    }

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

    // Convert to grid position within this screen/room.
    const screenWorldX = isIndoors
      ? (Math.floor(vp.linkX / 512) * 512)
      : ((result.screenIndex & 7) * 512);
    const screenWorldY = isIndoors
      ? (Math.floor(vp.linkY / 512) * 512)
      : (((result.screenIndex >> 3) & 7) * 512);

    const tileCol = Math.floor((worldX - screenWorldX) / 8);
    const tileRow = Math.floor((worldY - screenWorldY) / 8);

    if (tileRow < 0 || tileRow >= 64 || tileCol < 0 || tileCol >= 64) {
      setTooltip(null);
      if (onHoverTile) onHoverTile(-1, -1);
      return;
    }

    const attr = result.attrGrid[tileRow][tileCol];
    const reachable = result.reachable[tileRow][tileCol];
    const context = result.tileContext ?? 'overworld';
    const classification = classifyTileAttr(attr, context);
    const label = getAttrLabel(attr, context);
    const tileDef = getTileAttrsMap(context)[attr];
    const req = tileDef?.req ?? null;
    const hookTarget = tileDef?.hookTarget ?? false;
    const bfsBlocked = !!result.dynamicBlockerCells?.some(p => p.row === tileRow && p.col === tileCol);

    const spriteInfo = spriteRef.current
      .map(s => {
        const c0 = Math.floor((s.x - screenWorldX) / 8);
        const r0 = Math.floor((s.y - screenWorldY) / 8);
        const dr = Math.max(0, Math.abs(tileRow - r0) - 1);
        const dc = Math.max(0, Math.abs(tileCol - c0) - 1);
        const dist = dr + dc;
        return { s, r0, c0, dist };
      })
      .filter(x => x.r0 >= -1 && x.r0 < 65 && x.c0 >= -1 && x.c0 < 65 && x.dist === 0)
      .sort((a, b) => a.s.slot - b.s.slot)
      .map(({ s, r0, c0, dist }) => {
        const hex2 = (v: number) => v.toString(16).padStart(2, '0');
        const near = dist === 0 ? 'on' : `d${dist}`;
        return `#${s.slot} type 0x${hex2(s.type)} st 0x${hex2(s.state)} sub ${s.subtype}/${s.subtype2} e${s.e} @${c0},${r0} ${near}`;
      });

    // Check if player can currently satisfy the requirement
    let canPass: boolean | null = null;
    if (req) {
      switch (req) {
        case 'lift.1': canPass = true; break;
        case 'lift.2': canPass = equipment.gloves >= 1; break;
        case 'lift.3': canPass = equipment.gloves >= 2; break;
        case 'hammer': canPass = inventoryItems[11] >= 1; break;
        case 'boots': canPass = !!equipment.boots; break;
        case 'flippers': canPass = !!equipment.flippers; break;
      }
    }

    let tipX = mx + 14;
    let tipY = my - 60;

    // Keep tooltip away from active path geometry and A* requirement text while path hold is active.
    const activeTarget = pathPreviewState
      ? (pathPreviewState.lockTarget && pathPreviewState.lockedTile
        ? pathPreviewState.lockedTile
        : pathPreviewState.leftHeld ? pathPreviewState.hoverTile : null)
      : null;

    if (activeTarget) {
      const goal2x2 = findNearest2x2Goal(activeTarget.row, activeTarget.col, result.reachable);
      const path = goal2x2
        ? findPath2x2FromLink(vp.linkX, vp.linkY, screenWorldX, screenWorldY, goal2x2, result.reachable)
        : null;

      if (path && path.length > 1) {
        const points = path.map(p => {
          const wx = screenWorldX + p.col * 8 + 8; // center of 2×2
          const wy = screenWorldY + p.row * 8 + 8;
          return {
            x: (wx - viewLeft) * scaleX,
            y: (wy - viewTop) * scaleY,
          };
        });

        const reqSet = new Set<string>();
        for (const p of path) {
          const reqStr = result.reqGrid?.[p.row]?.[p.col] ?? '';
          if (!reqStr) continue;
          for (const reqName of reqStr.split(',')) reqSet.add(reqName);
        }
        const reqText = reqSet.size > 0 ? [...reqSet].sort().join(', ') : 'none';
        const debugLabel = `A* path req: ${reqText}${pathPreviewState?.lockTarget ? ' (locked)' : ''}`;

        const endPt = points[points.length - 1];
        const pathTextRect: Rect = {
          x: endPt.x + 10,
          y: endPt.y - 22,
          w: Math.max(120, debugLabel.length * 7),
          h: 18,
        };

        const tipW = 320;
        const tipH = 58;
        const clampRect = (r: Rect): Rect => ({
          x: Math.max(4, Math.min(width - r.w - 4, r.x)),
          y: Math.max(4, Math.min(height - r.h - 4, r.y)),
          w: r.w,
          h: r.h,
        });

        const candidates: Rect[] = [
          { x: mx + 14, y: my - 60, w: tipW, h: tipH },
          { x: mx + 14, y: my + 18, w: tipW, h: tipH },
          { x: mx - tipW - 14, y: my - 60, w: tipW, h: tipH },
          { x: mx - tipW - 14, y: my + 18, w: tipW, h: tipH },
          { x: 6, y: 6, w: tipW, h: tipH },
          { x: width - tipW - 6, y: 6, w: tipW, h: tipH },
          { x: 6, y: height - tipH - 6, w: tipW, h: tipH },
          { x: width - tipW - 6, y: height - tipH - 6, w: tipW, h: tipH },
        ].map(clampRect);

        const overlapsPath = (r: Rect): boolean => {
          for (let i = 1; i < points.length; i++) {
            if (segmentOverlapsRect(points[i - 1], points[i], r, 7)) return true;
          }
          return false;
        };

        const best = candidates.find(c => !rectsOverlap(c, pathTextRect) && !overlapsPath(c));
        const chosen = best ?? candidates[0];
        tipX = chosen.x;
        tipY = chosen.y;
      }
    }

    setTooltip({
      x: tipX, y: tipY,
      row: tileRow, col: tileCol,
      attr, label,
      type: classification.type === 'ledge' ? `ledge (${classification.dir})` : classification.type,
      req, canPass,
      reachable, hookTarget,
      pathReqs: result.reqGrid?.[tileRow]?.[tileCol] ?? '',
      bfsBlocked,
      spriteInfo,
    });
    if (onHoverTile) onHoverTile(tileRow, tileCol);
  }, [
    width,
    height,
    result,
    overworldScreenIndex,
    equipment.gloves,
    equipment.boots,
    equipment.flippers,
    inventoryItems,
    onHoverTile,
    pathPreviewState,
  ]);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setTooltip(null); if (onHoverTile) onHoverTile(-1, -1); }}
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
          left: tooltip.x,
          top: tooltip.y,
          background: 'rgba(10,10,20,0.92)',
          border: '1px solid rgba(100,200,255,0.3)',
          borderRadius: 4,
          padding: '5px 8px',
          pointerEvents: 'none',
          whiteSpace: 'normal',
          maxWidth: 760,
          fontFamily: 'monospace',
          fontSize: 11,
          lineHeight: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ color: '#888' }}>[{tooltip.row},{tooltip.col}]</span>
            <span style={{ color: tooltip.reachable ? '#4f8' : '#f66', fontWeight: 'bold' }}>
              {tooltip.reachable ? '✓ reachable' : '✗ blocked'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span style={{ color: '#6cf' }}>0x{tooltip.attr.toString(16).padStart(2, '0')}</span>
            <span style={{ color: '#fff' }}>{tooltip.label}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span style={{ color: '#aaa' }}>type:</span>
            <span style={{ color: '#fc6' }}>{tooltip.type}</span>
            {tooltip.req && <>
              <span style={{ color: '#aaa' }}>req:</span>
              <span style={{ color: tooltip.canPass ? '#4f8' : '#f66' }}>
                {tooltip.req} {tooltip.canPass ? '✓' : '✗'}
              </span>
            </>}
            {tooltip.hookTarget && (
              <span style={{ color: '#00ff88', fontWeight: 'bold' }}>⎆ hookshottable</span>
            )}
          </div>
          {tooltip.reachable && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ color: '#aaa' }}>path reqs:</span>
              <span style={{ color: tooltip.pathReqs ? '#ff9944' : '#888' }}>
                {tooltip.pathReqs || 'none'}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span style={{ color: '#aaa' }}>live sprites:</span>
            <span style={{ color: '#888' }}>{tooltip.spriteInfo.length}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span style={{ color: '#aaa' }}>Blocked In Last Flood Fill:</span>
            <span style={{ color: tooltip.bfsBlocked ? '#ff7777' : '#888' }}>
              {tooltip.bfsBlocked ? 'yes' : 'no'}
            </span>
          </div>
          {tooltip.spriteInfo.length > 0 && tooltip.spriteInfo.map((line, i) => (
            <div key={i} style={{ color: '#ffcc66' }}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export { ConnectionOverlay };
