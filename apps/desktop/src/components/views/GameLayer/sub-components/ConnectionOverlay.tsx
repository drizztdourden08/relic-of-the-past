import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useConnectionOverlayStore } from '../../../../stores/connection-overlay-store';
import { useGameUIStore } from '../../../../stores/game-ui-store';
import { wasmGetViewportInfo, wasmGetLiveSprites } from '../../../../lib/game';
import { classifyTileAttr } from '@shared/game/navigation/tile-classification';
import { getTileAttrsMap, getAttrLabel } from '@shared/game/navigation/tile-attrs';
import type { ReachState } from '@shared/game/navigation/types';
import { STAIRS_TRAVERSAL_STATE } from '@shared/game/navigation/types';

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

/** Check whether a 2×2 block (top-left at row,col) is fully reachable (player can stop here). */
function isValid2x2(row: number, col: number, reachable: ReachState[][]): boolean {
  if (row < 0 || row + 1 >= 64 || col < 0 || col + 1 >= 64) return false;
  return reachable[row][col] === 1 && reachable[row][col + 1] === 1 &&
         reachable[row + 1][col] === 1 && reachable[row + 1][col + 1] === 1;
}

/** Check if movement direction (dr,dc) is compatible with an encoded traversal state (>=2). */
function isTraversalDirCompatible(state: number, dr: number, dc: number): boolean {
  // state encodes direction: 2=s, 3=n, 4=e, 5=w, 6=se, 7=sw, 8=ne, 9=nw, 10=stairs(any)
  switch (state) {
    case 2: return dr === 1 && dc === 0;   // south
    case 3: return dr === -1 && dc === 0;  // north
    case 4: return dc === 1 && dr === 0;   // east
    case 5: return dc === -1 && dr === 0;  // west
    case 6: return dr === 1 || dc === 1;   // se
    case 7: return dr === 1 || dc === -1;  // sw
    case 8: return dr === -1 || dc === 1;  // ne
    case 9: return dr === -1 || dc === -1; // nw
    case 10: return true;                  // stairs — bidirectional
    default: return false;
  }
}

/** Check if a 2×2 move in direction (dr,dc) is valid — allows traversal tiles in their permitted direction. */
function isValidMove2x2(
  nr: number, nc: number, dr: number, dc: number,
  reachable: ReachState[][],
): boolean {
  if (nr < 0 || nr + 1 >= 64 || nc < 0 || nc + 1 >= 64) return false;
  const positions: [number, number][] = [[nr, nc], [nr, nc + 1], [nr + 1, nc], [nr + 1, nc + 1]];
  for (const [r, c] of positions) {
    const state = reachable[r][c];
    if (state === 0) return false;
    if (state >= 2) {
      if (!isTraversalDirCompatible(state, dr, dc)) return false;
    }
  }
  return true;
}

/**
 * Snap a cursor tile to the nearest valid 2×2 top-left corner.
 * Checks the 4 squares that contain the cursor tile first, then spirals out.
 */
function findNearest2x2Goal(cursorRow: number, cursorCol: number, reachable: ReachState[][]): GridPos | null {
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

/** A* where each node is the top-left of a 2×2 block — allows traversal tiles in their permitted direction. */
function findPath2x2AStar(
  start: GridPos, goal: GridPos, reachable: ReachState[][],
): GridPos[] | null {
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
      if (!isValidMove2x2(nr, nc, dr, dc, reachable)) continue;

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
  reachable: ReachState[][],
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
  const { visible, result, results, connections, fallHoleSpawns, setLockedPath } = useConnectionOverlayStore();
  const { overworldScreenIndex, roomIndex, isIndoors } = useGameUIStore(s => s.map);
  const activeScreenIndex = isIndoors ? roomIndex : overworldScreenIndex;

  // Compute layer1 void detection for overlay circles.
  // Tiles in enclosed 0x00 components on layer1 are real ground; boundary-touching = void.
  // Step 1: find enclosed 0x00 regions (seeds). Step 2: BFS from seeds through passable tiles.
  const layer1ReachableOverride = useMemo(() => {
    const layer0 = result?.dualLayerGrids?.layer0;
    const layer1 = result?.dualLayerGrids?.layer1;
    if (!layer0 || !layer1) return null;
    const grid: boolean[][] = Array.from({ length: 64 }, () => Array(64).fill(false));

    // Step 1: Flood from boundary through 0x00 to find void-connected tiles
    const boundaryConnected: boolean[][] = Array.from({ length: 64 }, () => Array(64).fill(false));
    const bQueue: Array<[number, number]> = [];
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        if ((r === 0 || r === 63 || c === 0 || c === 63) && layer1[r]?.[c] === 0x00) {
          boundaryConnected[r][c] = true;
          bQueue.push([r, c]);
        }
      }
    }
    while (bQueue.length > 0) {
      const [qr, qc] = bQueue.shift()!;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = qr + dr, nc = qc + dc;
        if (nr < 0 || nr >= 64 || nc < 0 || nc >= 64) continue;
        if (boundaryConnected[nr][nc]) continue;
        if (layer1[nr]?.[nc] !== 0x00) continue;
        boundaryConnected[nr][nc] = true;
        bQueue.push([nr, nc]);
      }
    }

    // Step 2: Enclosed seeds = 0x00 tiles NOT boundary-connected
    const seeds: Array<[number, number]> = [];
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        if (layer1[r]?.[c] === 0x00 && !boundaryConnected[r][c]) {
          grid[r][c] = true;
          seeds.push([r, c]);
        }
      }
    }

    // Step 3: BFS from seeds through ALL non-boundary-connected tiles
    // Expand freely (including through walls and layers-agree tiles)
    // Only mark grid=true where layers actually differ
    const visited: boolean[][] = Array.from({ length: 64 }, () => Array(64).fill(false));
    for (const [sr, sc] of seeds) visited[sr][sc] = true;
    const queue = [...seeds];
    while (queue.length > 0) {
      const [qr, qc] = queue.shift()!;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = qr + dr, nc = qc + dc;
        if (nr < 0 || nr >= 64 || nc < 0 || nc >= 64) continue;
        if (visited[nr][nc]) continue;
        if (boundaryConnected[nr][nc]) continue;
        visited[nr][nc] = true;
        const attr = layer1[nr]?.[nc] ?? 0;
        // Mark reachable only if layers disagree and layer1 has content
        if (attr !== 0x00 && layer0[nr]?.[nc] !== attr) {
          grid[nr][nc] = true;
        }
        queue.push([nr, nc]);
      }
    }

    return grid;
  }, [result?.dualLayerGrids?.layer0, result?.dualLayerGrids?.layer1]);

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
      const getScreenWorldOrigin = (screenIndex: number) => {
        if (isIndoors) {
          // Indoor: derive origin from Link's position (room index doesn't map
          // directly to BG coordinates for house/cave rooms 0x100+)
          return { x: screenWorldX, y: screenWorldY };
        }
        return {
          x: (screenIndex & 7) * 512,
          y: ((screenIndex >> 3) & 7) * 512,
        };
      };

      // Sub-tile size in game pixels
      const TILE_PX = 8;
      // Dot radius in display pixels
      const dotRadius = Math.max(2.5, 4 * Math.min(scaleX, scaleY));

      // Draw reachable tiles as dots (skip ledge/traversal/stairs tiles — those get arrows instead)
      const LEDGE_ATTRS = new Set([0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x01, 0x02, 0x03, 0x1a, 0x12, 0x11, 0x13, 0x19, 0x1b, 0x3d]);
      // Overlay dot colors: consistent across regular dots and split circle halves
      const DOT_COLOR_REACHABLE = 'rgba(80, 200, 255, 0.6)';
      const DOT_COLOR_REQ = 'rgba(255, 100, 180, 0.35)';
      ctx.globalAlpha = 0.55;
      for (const drawResult of drawResults) {
        const origin = getScreenWorldOrigin(drawResult.screenIndex);
        const hasDualLayer = !!layer1ReachableOverride || !!drawResult.layer1Reachable;
        for (let r = 0; r < 64; r++) {
          for (let c = 0; c < 64; c++) {
            const mergedReachable = drawResult.reachable[r][c] === 1;
            const layer1Reach = hasDualLayer && (layer1ReachableOverride?.[r]?.[c] ?? drawResult.layer1Reachable?.[r]?.[c] ?? false);
            if (!mergedReachable && !layer1Reach) continue;

            // Split circle only for upper-floor-exclusive tiles (layer1 reachable, merged not)
            const layersDisagree = hasDualLayer && !!layer1Reach && !mergedReachable;

            // Skip ledge/traversal tiles (they get arrows) — but NOT split-circle tiles
            if (!layersDisagree && drawResult.attrGrid && LEDGE_ATTRS.has(drawResult.attrGrid[r][c])) continue;

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

            const hasReq = drawResult.reqGrid && drawResult.reqGrid[r][c] !== '';
            const radius = dotRadius * 0.6;

            if (layersDisagree) {
              // Split circle: left = ground/layer1, right = above/layer0
              // Same color rules as regular dots: cyan=reachable, pink=has req, transparent=not reachable
              const splitAlpha = ctx.globalAlpha;
              ctx.globalAlpha = 0.85;

              // Left half = GROUND (layer1): drawn only if merged flood fill reached it
              if (mergedReachable) {
                ctx.fillStyle = hasReq ? DOT_COLOR_REQ : DOT_COLOR_REACHABLE;
                ctx.beginPath();
                ctx.arc(dx, dy, radius, Math.PI * 0.5, Math.PI * 1.5);
                ctx.fill();
              }

              // Right half = ABOVE (layer0): drawn only if upper-floor BFS reached it
              if (layer1Reach) {
                ctx.fillStyle = hasReq ? DOT_COLOR_REQ : DOT_COLOR_REACHABLE;
                ctx.beginPath();
                ctx.arc(dx, dy, radius, -Math.PI * 0.5, Math.PI * 0.5);
                ctx.fill();
              }

              // Black border around full circle
              ctx.strokeStyle = '#000';
              ctx.lineWidth = Math.max(1, Math.min(scaleX, scaleY) * 0.6);
              ctx.beginPath();
              ctx.arc(dx, dy, radius, 0, Math.PI * 2);
              ctx.stroke();
              ctx.globalAlpha = splitAlpha;
            } else if (mergedReachable) {
              // Regular dot (layers agree — both reachable)
              ctx.fillStyle = hasReq ? DOT_COLOR_REQ : DOT_COLOR_REACHABLE;
              ctx.beginPath();
              ctx.arc(dx, dy, radius, 0, Math.PI * 2);
              ctx.fill();
            }
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

      // Draw hookshot targets: same-colored dot with a thin green ring border
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1;
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
          ctx.fillStyle = hasReq ? DOT_COLOR_REQ : DOT_COLOR_REACHABLE;
          ctx.beginPath();
          ctx.arc(dx, dy, dotRadius * 0.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(dx, dy, dotRadius * 0.65, 0, Math.PI * 2);
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
          ? findPath2x2FromLink(vp.linkX, vp.linkY + 8, screenWorldX, screenWorldY, goal2x2, result.reachable)
          : null;

        // Push path to store when locked so the widget can copy it
        if (ms.lockTarget) {
          const attrGrid = result.attrGrid;
          if (path && attrGrid) {
            const pathTiles = path.map(p => ({ row: p.row, col: p.col, attr: attrGrid[p.row]?.[p.col] ?? -1 }));
            setLockedPath(pathTiles);
          } else {
            setLockedPath(null);
          }
        }

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
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = '#cc5555';
      ctx.fillStyle = '#cc5555';
      for (const drawResult of drawResults) {
        const origin = getScreenWorldOrigin(drawResult.screenIndex);
        for (const ledge of drawResult.ledges ?? []) {
        // Start position (edge of trigger tile facing away from direction)
        const startWorldX = origin.x + ledge.startCol * TILE_PX + TILE_PX / 2;
        const startWorldY = origin.y + ledge.startRow * TILE_PX + TILE_PX / 2;
        // End position (center of landing tile)
        const endWorldX = origin.x + ledge.endCol * TILE_PX + TILE_PX / 2;
        const endWorldY = origin.y + ledge.endRow * TILE_PX + TILE_PX / 2;

        // Compute direction to determine start edge offset
        const dirX = endWorldX - startWorldX;
        const dirY = endWorldY - startWorldY;
        const dirLen = Math.hypot(dirX, dirY);
        if (dirLen === 0) continue;
        const normX = dirX / dirLen;
        const normY = dirY / dirLen;

        // Start at the near edge of the trigger tile (half tile back from center)
        const edgeStartX = startWorldX - normX * (TILE_PX / 2);
        const edgeStartY = startWorldY - normY * (TILE_PX / 2);

        const startSX = edgeStartX - viewLeft;
        const startSY = edgeStartY - viewTop;
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

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = TILE_PX * Math.min(scaleX, scaleY) * 0.5;
        const spread = 0.5;
        const shaftWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));

        // Shaft — stop at arrowhead base, not tip
        ctx.lineWidth = shaftWidth;
        const dx = Math.cos(angle) * headLen * 0.85;
        const dy = Math.sin(angle) * headLen * 0.85;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2 - dx, y2 - dy);
        ctx.stroke();

        // Arrowhead at end (filled triangle)
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - spread), y2 - headLen * Math.sin(angle - spread));
        ctx.lineTo(x2 - headLen * Math.cos(angle + spread), y2 - headLen * Math.sin(angle + spread));
        ctx.closePath();
        ctx.fill();
        }
      }

      // Draw stairs as purple double-ended arrows (bidirectional traversal)
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = '#aa44ff';
      ctx.fillStyle = '#aa44ff';
      for (const drawResult of drawResults) {
        if (!drawResult.attrGrid) continue;
        const origin = getScreenWorldOrigin(drawResult.screenIndex);
        // Find connected runs of 0x3D tiles that are reachable (state = STAIRS_TRAVERSAL_STATE)
        // Group vertically (stairs are typically vertical columns)
        const visited = new Set<string>();
        for (let r = 0; r < 64; r++) {
          for (let c = 0; c < 64; c++) {
            if (drawResult.reachable[r][c] !== STAIRS_TRAVERSAL_STATE) continue;
            if (visited.has(`${r},${c}`)) continue;
            // Trace connected stairs tiles (vertical run)
            let minR = r, maxR = r;
            visited.add(`${r},${c}`);
            let nr = r + 1;
            while (nr < 64 && drawResult.reachable[nr][c] === STAIRS_TRAVERSAL_STATE) {
              visited.add(`${nr},${c}`);
              maxR = nr;
              nr++;
            }
            // Only draw arrow if run is at least 2 tiles
            if (maxR - minR < 1) continue;

            const startWorldX = origin.x + c * TILE_PX + TILE_PX / 2;
            const startWorldY = origin.y + minR * TILE_PX;  // top edge of first stair tile
            const endWorldX = origin.x + c * TILE_PX + TILE_PX / 2;
            const endWorldY = origin.y + (maxR + 1) * TILE_PX;  // bottom edge of last stair tile

            const startSX = startWorldX - viewLeft;
            const startSY = startWorldY - viewTop;
            const endSX = endWorldX - viewLeft;
            const endSY = endWorldY - viewTop;

            if (startSY > snesH + TILE_PX && endSY > snesH + TILE_PX) continue;
            if (startSY < -TILE_PX && endSY < -TILE_PX) continue;

            const x1 = startSX * scaleX;
            const y1 = startSY * scaleY;
            const x2 = endSX * scaleX;
            const y2 = endSY * scaleY;

            const angle = Math.atan2(y2 - y1, x2 - x1);
            const lineLen = Math.hypot(x2 - x1, y2 - y1);
            const headLen = Math.min(TILE_PX * Math.min(scaleX, scaleY) * 0.5, lineLen * 0.25);
            const spread = 0.5;
            const shaftWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));

            // Shaft — stop at arrowhead bases, not tips
            ctx.strokeStyle = '#ffffff';
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = shaftWidth;
            const dx = Math.cos(angle) * headLen * 0.85;
            const dy = Math.sin(angle) * headLen * 0.85;
            ctx.beginPath();
            ctx.moveTo(x1 + dx, y1 + dy);
            ctx.lineTo(x2 - dx, y2 - dy);
            ctx.stroke();
            // Bottom arrowhead
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - headLen * Math.cos(angle - spread), y2 - headLen * Math.sin(angle - spread));
            ctx.lineTo(x2 - headLen * Math.cos(angle + spread), y2 - headLen * Math.sin(angle + spread));
            ctx.closePath();
            ctx.fill();
            // Top arrowhead
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 - headLen * Math.cos(angle - spread + Math.PI), y1 - headLen * Math.sin(angle - spread + Math.PI));
            ctx.lineTo(x1 - headLen * Math.cos(angle + spread + Math.PI), y1 - headLen * Math.sin(angle + spread + Math.PI));
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // Draw connection border tiles as larger colored dots
      ctx.globalAlpha = 0.85;
      for (const conn of connections) {
        ctx.fillStyle = conn.isIntraRoom ? '#66eebb' : (EDGE_COLORS[conn.edge] ?? '#fff');
        // Use source screen origin if available, otherwise fall back to primary screen
        const connOrigin = conn.sourceScreen != null
          ? getScreenWorldOrigin(conn.sourceScreen)
          : { x: screenWorldX, y: screenWorldY };
        for (const pos of conn.positions) {
          let r: number, c: number;
          if (conn.isIntraRoom) {
            // Intra-room boundaries are at the quadrant midpoint (row/col 31 or 32)
            switch (conn.edge) {
              case 'north': r = 32; c = pos; break;
              case 'south': r = 31; c = pos; break;
              case 'east': r = pos; c = 31; break;
              case 'west': r = pos; c = 32; break;
              default: continue;
            }
          } else {
            switch (conn.edge) {
              case 'north': r = 0; c = pos; break;
              case 'south': r = 63; c = pos; break;
              case 'east': r = pos; c = 63; break;
              case 'west': r = pos; c = 0; break;
              default: continue;
            }
          }

          const worldX = connOrigin.x + c * TILE_PX + TILE_PX / 2;
          const worldY = connOrigin.y + r * TILE_PX + TILE_PX / 2;
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
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = EDGE_COLORS.entrance;
      for (const drawResult of drawResults) {
        const origin = getScreenWorldOrigin(drawResult.screenIndex);
        for (const ent of drawResult.entrances) {
        // Only show entrances that BFS reached (have a matching transition)
        if (!drawResult.transitions.some(t => t.entranceIdx === ent.id)) continue;
        // Entrance trigger is a single Map16 tile = 2×2 sub-tiles (16×16 game px)
        // On overworld DOORS (id < 200), the game triggers on Link's LEFT edge,
        // so shift +8px to center the marker on Link's visual center when entering.
        // Fall holes (id >= 200) and indoor markers use tile-exact positions.
        const xOffset = (!isIndoors && ent.id < 200) ? 8 : 0;
        const worldX = origin.x + ent.gridCol * TILE_PX + xOffset;
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

      // ─── Fall hole landing markers (construction stripe pattern) ───
      if (fallHoleSpawns.length > 0 && isIndoors) {
        const origin = getScreenWorldOrigin(drawResults[0]?.screenIndex ?? activeScreenIndex);
        for (const fh of fallHoleSpawns) {
          const worldX = origin.x + fh.gridCol * TILE_PX;
          const worldY = origin.y + fh.gridRow * TILE_PX;
          const screenX = worldX - viewLeft;
          const screenY = worldY - viewTop;
          if (screenX < -TILE_PX * 4 || screenX > snesW + TILE_PX * 4) continue;
          if (screenY < -TILE_PX * 4 || screenY > snesH + TILE_PX * 4) continue;

          // Draw a 2×2 tile (16×16 game px) marker with diagonal stripes
          const dx = screenX * scaleX;
          const dy = screenY * scaleY;
          const dw = TILE_PX * 2 * scaleX;
          const dh = TILE_PX * 2 * scaleY;

          // Yellow diagonal stripes (construction/hazard pattern)
          ctx.save();
          ctx.beginPath();
          ctx.rect(dx, dy, dw, dh);
          ctx.clip();
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = '#ffcc44';
          const stripe = Math.max(3, 4 * Math.min(scaleX, scaleY));
          ctx.lineWidth = stripe * 0.6;
          const steps = Math.ceil((dw + dh) / stripe) + 2;
          for (let s = -steps; s <= steps; s++) {
            const offset = s * stripe;
            ctx.beginPath();
            ctx.moveTo(dx + offset, dy);
            ctx.lineTo(dx + offset + dh, dy + dh);
            ctx.stroke();
          }
          // Border
          ctx.globalAlpha = 0.9;
          ctx.strokeStyle = '#ffcc44';
          ctx.lineWidth = Math.max(1.5, 2 * Math.min(scaleX, scaleY));
          ctx.strokeRect(dx, dy, dw, dh);
          ctx.restore();
        }
      }

      // ─── Fall zone hazard stripes (pit tiles: 0x20) ───
      // Diagonal yellow/transparent pattern on pit tiles that BFS reached
      ctx.globalAlpha = 0.45;
      const stripeSize = Math.max(2, 3 * Math.min(scaleX, scaleY));
      for (const drawResult of drawResults) {
        if (!drawResult.attrGrid) continue;
        const origin = getScreenWorldOrigin(drawResult.screenIndex);
        for (let r = 0; r < 64; r++) {
          for (let c = 0; c < 64; c++) {
            if (drawResult.attrGrid[r][c] !== 0x20) continue;
            // Only show pits adjacent to reachable tiles (within 1 tile)
            let nearReachable = false;
            for (let dr = -1; dr <= 1 && !nearReachable; dr++) {
              for (let dc = -1; dc <= 1 && !nearReachable; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < 64 && nc >= 0 && nc < 64 && drawResult.reachable[nr][nc] === 1) {
                  nearReachable = true;
                }
              }
            }
            if (!nearReachable) continue;

            const worldX = origin.x + c * TILE_PX;
            const worldY = origin.y + r * TILE_PX;
            const screenX = worldX - viewLeft;
            const screenY = worldY - viewTop;
            if (screenX < -TILE_PX || screenX > snesW + TILE_PX) continue;
            if (screenY < -TILE_PX || screenY > snesH + TILE_PX) continue;

            const dx = screenX * scaleX;
            const dy = screenY * scaleY;
            const tw = TILE_PX * scaleX;
            const th = TILE_PX * scaleY;

            // Draw diagonal stripes within tile bounds
            ctx.save();
            ctx.beginPath();
            ctx.rect(dx, dy, tw, th);
            ctx.clip();
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = stripeSize * 0.7;
            // Diagonal lines from bottom-left to top-right
            for (let s = -tw; s < tw + th; s += stripeSize * 2) {
              ctx.beginPath();
              ctx.moveTo(dx + s, dy + th);
              ctx.lineTo(dx + s + th, dy);
              ctx.stroke();
            }
            ctx.restore();
          }
        }
      }

      // ─── Debug: Link's position and tile coverage ───
      ctx.globalAlpha = 1.0;
      const linkWorldX = vp.linkX;
      const linkWorldY = vp.linkY + 8; // collision hitbox starts 8px below sprite top (skip head)
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

      // Draw live sprite 16x16 footprints for navigation-relevant sprites only.
      // Only show sprites that affect pathfinding (blocker/guard types).
      const liveSprites = wasmGetLiveSprites();
      if (liveSprites.length > 0) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ff2222';
        ctx.lineWidth = Math.max(1.5, 2.5 * Math.min(scaleX, scaleY));
        for (const s of liveSprites) {
          // Only highlight navigation blockers (guards/barriers + uncle)
          if (s.type !== 0x3f && s.type !== 0x40 && !(s.type === 0x73 && s.e === 0)) continue;
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
  }, [visible, result, results, connections, fallHoleSpawns, width, height, gameRunning, activeScreenIndex, isIndoors, overworldScreenIndex, layer1ReachableOverride]);

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
      <div style={{ color: '#ffee00' }}>Shift+drag: select tiles → clipboard</div>
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
      <LegendItem color="#aa44ff" label="stairs (bidirectional)" isArrow />
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
    reachable: ReachState;
    hookTarget: boolean;
    /** Accumulated requirements the BFS needed to reach this tile (from reqGrid) */
    pathReqs: string;
    bfsBlocked: boolean;
    spriteInfo: string[];
    /** Layer info for dual-layer rooms */
    layer0Attr?: number;
    layer1Attr?: number;
    layer1Reach?: boolean;
  } | null>(null);
  const vpRef = useRef<ReturnType<typeof wasmGetViewportInfo>>(null);

  // ─── Rectangle selection state (Shift+LMB drag) ───
  const [rectSel, setRectSel] = useState<{
    startRow: number; startCol: number;
    endRow: number; endCol: number;
    active: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute layer1 void detection: tiles in enclosed 0x00 components are real ground,
  // tiles in boundary-touching 0x00 components are void. Used to suppress false split tooltips.
  const layer1ReachableLocal = useMemo(() => {
    const layer0 = result.dualLayerGrids?.layer0;
    const layer1 = result.dualLayerGrids?.layer1;
    if (!layer0 || !layer1) return undefined;
    const grid: boolean[][] = Array.from({ length: 64 }, () => Array(64).fill(false));

    // Step 1: Flood from boundary through 0x00 to find void-connected tiles
    const boundaryConnected: boolean[][] = Array.from({ length: 64 }, () => Array(64).fill(false));
    const bQueue: Array<[number, number]> = [];
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        if ((r === 0 || r === 63 || c === 0 || c === 63) && layer1[r]?.[c] === 0x00) {
          boundaryConnected[r][c] = true;
          bQueue.push([r, c]);
        }
      }
    }
    while (bQueue.length > 0) {
      const [qr, qc] = bQueue.shift()!;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = qr + dr, nc = qc + dc;
        if (nr < 0 || nr >= 64 || nc < 0 || nc >= 64) continue;
        if (boundaryConnected[nr][nc]) continue;
        if (layer1[nr]?.[nc] !== 0x00) continue;
        boundaryConnected[nr][nc] = true;
        bQueue.push([nr, nc]);
      }
    }

    // Step 2: Enclosed seeds = 0x00 tiles NOT boundary-connected
    const seeds: Array<[number, number]> = [];
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        if (layer1[r]?.[c] === 0x00 && !boundaryConnected[r][c]) {
          grid[r][c] = true;
          seeds.push([r, c]);
        }
      }
    }

    // Step 3: BFS from seeds through ALL non-boundary-connected tiles
    // Expand freely (including through walls and layers-agree tiles)
    // Only mark grid=true where layers actually differ
    const visited: boolean[][] = Array.from({ length: 64 }, () => Array(64).fill(false));
    for (const [sr, sc] of seeds) visited[sr][sc] = true;
    const queue = [...seeds];
    while (queue.length > 0) {
      const [qr, qc] = queue.shift()!;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = qr + dr, nc = qc + dc;
        if (nr < 0 || nr >= 64 || nc < 0 || nc >= 64) continue;
        if (visited[nr][nc]) continue;
        if (boundaryConnected[nr][nc]) continue;
        visited[nr][nc] = true;
        const attr = layer1[nr]?.[nc] ?? 0;
        // Mark reachable only if layers disagree and layer1 has content
        if (attr !== 0x00 && layer0[nr]?.[nc] !== attr) {
          grid[nr][nc] = true;
        }
        queue.push([nr, nc]);
      }
    }

    return grid;
  }, [result.dualLayerGrids?.layer0, result.dualLayerGrids?.layer1]);

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

  // Debug: expose function to programmatically trigger tooltip from CLI tools
  useEffect(() => {
    (window as any).__debugHoverTile = (col: number, row: number) => {
      const vp = vpRef.current;
      if (!vp || !result.attrGrid) return false;
      if (row < 0 || row >= 64 || col < 0 || col >= 64) return false;

      const attr = result.attrGrid[row][col];
      const reachable = result.reachable[row][col];
      const context = result.tileContext ?? 'overworld';
      const label = getAttrLabel(attr, context);
      const classification = classifyTileAttr(attr, context);
      const tileDef = getTileAttrsMap(context)[attr];

      setTooltip({
        x: width / 2, y: 40,
        row, col,
        attr, label,
        type: classification.type === 'ledge' ? `ledge (${classification.dir})` : classification.type,
        req: tileDef?.req ?? null,
        canPass: null,
        reachable,
        hookTarget: tileDef?.hookTarget ?? false,
        pathReqs: result.reqGrid?.[row]?.[col] ?? '',
        bfsBlocked: false,
        spriteInfo: [],
        layer0Attr: result.dualLayerGrids?.layer0[row]?.[col],
        layer1Attr: result.dualLayerGrids?.layer1[row]?.[col],
        layer1Reach: layer1ReachableLocal?.[row]?.[col] ?? result.layer1Reachable?.[row]?.[col],
      });
      return true;
    };
    return () => { delete (window as any).__debugHoverTile; };
  }, [result, width, height, layer1ReachableLocal]);

  /** Convert mouse event to tile [row, col] or null if out of bounds */
  const mouseToTile = useCallback((e: React.MouseEvent<HTMLDivElement>): GridPos | null => {
    const vp = vpRef.current;
    if (!vp || !result.attrGrid) return null;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const snesW = vp.snesWidth;
    const snesH = vp.snesHeight;
    const scaleX = width / snesW;
    const scaleY = height / snesH;
    const snesX = mx / scaleX;
    const snesY = my / scaleY;
    const viewLeft = vp.cameraX - vp.extraLeftRight;
    const viewTop = vp.cameraY;
    const worldX = snesX + viewLeft;
    const worldY = snesY + viewTop;
    const screenWorldX = isIndoors
      ? (Math.floor(vp.linkX / 512) * 512)
      : ((result.screenIndex & 7) * 512);
    const screenWorldY = isIndoors
      ? (Math.floor(vp.linkY / 512) * 512)
      : (((result.screenIndex >> 3) & 7) * 512);
    const col = Math.floor((worldX - screenWorldX) / 8);
    const row = Math.floor((worldY - screenWorldY) / 8);
    if (row < 0 || row >= 64 || col < 0 || col >= 64) return null;
    return { row, col };
  }, [width, height, result, isIndoors]);

  // Rectangle selection handlers
  const handleRectMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.shiftKey || e.button !== 0) return;
    const tile = mouseToTile(e);
    if (!tile) return;
    e.preventDefault();
    e.stopPropagation();
    setRectSel({ startRow: tile.row, startCol: tile.col, endRow: tile.row, endCol: tile.col, active: true });
    setCopied(false);
  }, [mouseToTile]);

  const handleRectMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectSel?.active) return;
    const tile = mouseToTile(e);
    if (!tile) return;
    setRectSel(s => s ? { ...s, endRow: tile.row, endCol: tile.col } : s);
  }, [rectSel?.active, mouseToTile]);

  const handleRectMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectSel?.active || e.button !== 0) return;
    const tile = mouseToTile(e);
    if (tile) {
      setRectSel(s => s ? { ...s, endRow: tile.row, endCol: tile.col, active: false } : s);
    } else {
      setRectSel(s => s ? { ...s, active: false } : s);
    }

    // Collect tile data in the rectangle
    const sel = rectSel;
    const endRow = tile?.row ?? sel.endRow;
    const endCol = tile?.col ?? sel.endCol;
    const r0 = Math.min(sel.startRow, endRow);
    const r1 = Math.max(sel.startRow, endRow);
    const c0 = Math.min(sel.startCol, endCol);
    const c1 = Math.max(sel.startCol, endCol);

    if (!result.attrGrid) return;

    const context = result.tileContext ?? 'overworld';
    // Build raw grid output: each row is an array of { attr, reachState } per tile
    const rows: string[] = [];
    for (let r = r0; r <= r1; r++) {
      const cells: string[] = [];
      for (let c = c0; c <= c1; c++) {
        const attr = result.attrGrid[r][c];
        const reach = result.reachable[r][c];
        const ch = reach === 0 ? '-' : reach === 1 ? '+' : '~';
        cells.push(`${attr.toString(16).padStart(2, '0')}${ch}`);
      }
      rows.push(cells.join(' '));
    }

    const header = [
      `Tile Selection [${r0},${c0}] to [${r1},${c1}] (${(r1 - r0 + 1)}×${(c1 - c0 + 1)} = ${(r1 - r0 + 1) * (c1 - c0 + 1)} tiles)`,
      `Context: ${context} | Screen: 0x${result.screenIndex.toString(16).padStart(2, '0')}`,
      `Format: <hex_attr><+reachable|~traversal|-blocked>`,
      ``,
    ];

    const text = header.join('\n') + rows.join('\n');
    navigator.clipboard.writeText(text).then(() => setCopied(true));
  }, [rectSel, result, mouseToTile]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // If doing rectangle selection, only update the rect, skip tooltip
    if (rectSel?.active) {
      handleRectMouseMove(e);
      return;
    }

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
        ? findPath2x2FromLink(vp.linkX, vp.linkY + 8, screenWorldX, screenWorldY, goal2x2, result.reachable)
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
      layer0Attr: result.dualLayerGrids?.layer0[tileRow]?.[tileCol],
      layer1Attr: result.dualLayerGrids?.layer1[tileRow]?.[tileCol],
      layer1Reach: layer1ReachableLocal?.[tileRow]?.[tileCol] ?? result.layer1Reachable?.[tileRow]?.[tileCol],
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
    rectSel?.active,
    handleRectMouseMove,
    layer1ReachableLocal,
  ]);

  // Compute selection rectangle in display pixels for the visual overlay
  const selectionRect = (() => {
    if (!rectSel) return null;
    const vp = vpRef.current;
    if (!vp) return null;
    const snesW = vp.snesWidth;
    const snesH = vp.snesHeight;
    const scaleX = width / snesW;
    const scaleY = height / snesH;
    const viewLeft = vp.cameraX - vp.extraLeftRight;
    const viewTop = vp.cameraY;
    const screenWorldX = isIndoors
      ? (Math.floor(vp.linkX / 512) * 512)
      : ((result.screenIndex & 7) * 512);
    const screenWorldY = isIndoors
      ? (Math.floor(vp.linkY / 512) * 512)
      : (((result.screenIndex >> 3) & 7) * 512);
    const r0 = Math.min(rectSel.startRow, rectSel.endRow);
    const r1 = Math.max(rectSel.startRow, rectSel.endRow);
    const c0 = Math.min(rectSel.startCol, rectSel.endCol);
    const c1 = Math.max(rectSel.startCol, rectSel.endCol);
    const x = (screenWorldX + c0 * 8 - viewLeft) * scaleX;
    const y = (screenWorldY + r0 * 8 - viewTop) * scaleY;
    const w = (c1 - c0 + 1) * 8 * scaleX;
    const h = (r1 - r0 + 1) * 8 * scaleY;
    return { x, y, w, h, tileCount: (r1 - r0 + 1) * (c1 - c0 + 1) };
  })();

  return (
    <div
      data-testid="tile-inspector"
      onMouseMove={handleMouseMove}
      onMouseDown={handleRectMouseDown}
      onMouseUp={handleRectMouseUp}
      onMouseLeave={() => { setTooltip(null); if (onHoverTile) onHoverTile(-1, -1); }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width,
        height,
        zIndex: 6,
        cursor: rectSel?.active ? 'crosshair' : undefined,
      }}
    >
      {/* Rectangle selection visual */}
      {selectionRect && (
        <div style={{
          position: 'absolute',
          left: selectionRect.x,
          top: selectionRect.y,
          width: selectionRect.w,
          height: selectionRect.h,
          border: '2px solid #ffee00',
          background: 'rgba(255, 238, 0, 0.12)',
          pointerEvents: 'none',
          zIndex: 7,
        }} />
      )}
      {/* Copied confirmation badge */}
      {copied && rectSel && !rectSel.active && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 8,
          transform: 'translateX(-50%)',
          background: 'rgba(20,180,60,0.92)',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: 4,
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: 'bold',
          pointerEvents: 'none',
          zIndex: 8,
        }}>
          Tile data copied to clipboard! ({selectionRect?.tileCount} tiles)
        </div>
      )}
      {tooltip && !rectSel?.active && (
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
            <span style={{ color: tooltip.reachable === 1 ? '#4f8' : tooltip.reachable >= 2 ? '#fc0' : '#f66', fontWeight: 'bold' }}>
              {tooltip.reachable === 1 ? '✓ reachable' : tooltip.reachable >= 2 ? '➔ traversal' : '✗ blocked'}
            </span>
          </div>
          {tooltip.layer0Attr !== undefined && tooltip.layer0Attr !== (tooltip.layer1Attr ?? 0) && (tooltip.layer1Reach || (tooltip.layer1Attr ?? 0) !== 0x00) ? (() => {
            const ctx0 = result.tileContext ?? 'overworld';
            const a0 = tooltip.layer0Attr!;
            const a1 = tooltip.layer1Attr ?? 0;
            const cls0 = classifyTileAttr(a0, ctx0);
            const cls1 = classifyTileAttr(a1, ctx0);
            const lbl0 = getAttrLabel(a0, ctx0);
            const lbl1 = getAttrLabel(a1, ctx0);
            const def0 = getTileAttrsMap(ctx0)[a0];
            const def1 = getTileAttrsMap(ctx0)[a1];
            const l1Reach = tooltip.layer1Reach;
            const l0Passable = cls0.type === 'free' || cls0.type === 'ledge';
            const l1Passable = cls1.type === 'free' || cls1.type === 'ledge';
            return (
              <div style={{ display: 'flex', gap: 0 }}>
                {/* Ground layer (layer1) */}
                <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.15)', paddingRight: 6, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <div style={{ color: '#66ccff', fontWeight: 'bold', fontSize: 10 }}>▼ GROUND</div>
                  <div><span style={{ color: '#6cf' }}>0x{a1.toString(16).padStart(2, '0')}</span> <span style={{ color: '#fff' }}>{lbl1}</span></div>
                  <div><span style={{ color: '#aaa' }}>type:</span> <span style={{ color: '#fc6' }}>{cls1.type === 'ledge' ? `ledge (${cls1.dir})` : cls1.type}</span></div>
                  {def1?.req && <div><span style={{ color: '#aaa' }}>req:</span> <span style={{ color: '#fc6' }}>{def1.req}</span></div>}
                  <div style={{ color: l1Passable ? '#4f8' : '#f66', fontWeight: 'bold' }}>
                    {l1Passable ? '~ passable' : '✗ wall'}
                  </div>
                </div>
                {/* Above layer (layer0) */}
                <div style={{ flex: 1, paddingLeft: 6, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <div style={{ color: '#ff9966', fontWeight: 'bold', fontSize: 10 }}>▲ ABOVE</div>
                  <div><span style={{ color: '#6cf' }}>0x{a0.toString(16).padStart(2, '0')}</span> <span style={{ color: '#fff' }}>{lbl0}</span></div>
                  <div><span style={{ color: '#aaa' }}>type:</span> <span style={{ color: '#fc6' }}>{cls0.type === 'ledge' ? `ledge (${cls0.dir})` : cls0.type}</span></div>
                  {def0?.req && <div><span style={{ color: '#aaa' }}>req:</span> <span style={{ color: '#fc6' }}>{def0.req}</span></div>}
                  <div style={{ color: (tooltip.reachable === 1 || l1Reach || l0Passable) ? '#4f8' : '#f66', fontWeight: 'bold' }}>
                    {(tooltip.reachable === 1 || l1Reach) ? '✓ reachable' : l0Passable ? '~ passable' : '✗ wall'}
                  </div>
                </div>
              </div>
            );
          })() : (<>
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
          </>)}
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
