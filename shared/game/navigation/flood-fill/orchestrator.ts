import type {
  FloodFillResult, OverworldEntrance, LedgeTraversal,
  GridPos, CollisionGrid, ScreenVariant, ReachState,
} from '../types';
import type { TileAttrContext } from '../tile-attrs';
import type { TileReq } from '../tile-attrs';
import { GRID_SIZE } from '../types';
import { unmetRequirements } from '../core/inventory';
import { getAdjacentScreen } from '../core/grid-utils';
import { buildCollisionGridFromRawAttr } from '../screen-data/collision-grid';
import { processStraightCliffs, processDiagonalCliffs, processSouthCliffs } from '../screen-data/cliff-preprocessing';
import { floodFillBFS } from './single-screen';
import type { QuadrantBounds } from './single-screen';

// ─── Screen Preparation ──────────────────────────────────────────────────────

function prepareScreen(
  rawAttrGrid: number[][],
  tileContext: TileAttrContext,
  dynamicBlockers?: GridPos[],
  skipCliffs = false,
): { grid: CollisionGrid; ledges: LedgeTraversal[]; dynamicBlockerCells: GridPos[] } {
  const dynamicBlockerCells: GridPos[] = [];
  const grid = buildCollisionGridFromRawAttr(rawAttrGrid, tileContext);

  // Apply dynamic blockers (uncle, guards, etc.)
  if (dynamicBlockers?.length) {
    const seen = new Set<string>();
    for (const b of dynamicBlockers) {
      for (let dr = 0; dr < 2; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          const rr = b.row + dr;
          const cc = b.col + dc;
          if (rr < 0 || rr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE) continue;
          grid.rawAttr[rr][cc] = 0x01;
          grid.tiles[rr][cc] = { type: 'blocked' };
          const key = `${rr},${cc}`;
          if (!seen.has(key)) {
            seen.add(key);
            dynamicBlockerCells.push({ row: rr, col: cc });
          }
        }
      }
    }
  }

  // Cliff preprocessing (ledge one-way traversals) — skip for layer 1 (no cliffs there)
  const ledges: LedgeTraversal[] = [];
  if (!skipCliffs) {
    const isIndoors = tileContext !== 'overworld';
    processStraightCliffs(grid.tiles, grid.rawAttr, ledges, isIndoors);
    processDiagonalCliffs(grid.tiles, grid.rawAttr, ledges);
    processSouthCliffs(grid.tiles, grid.rawAttr, ledges);
  }

  return { grid, ledges, dynamicBlockerCells };
}

/** Passable raw attrs for layer detection (tiles Link can stand on). */
const PASSABLE_ATTRS = new Set([
  0x00, 0x05, 0x06, 0x08, 0x09, 0x0A, 0x0D, 0x0E, 0x0F,
  0x1C, 0x1E, 0x1F, 0x22, 0x27, 0x28, 0x29, 0x2A, 0x2B,
  0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
  0x3D, 0x40, 0x44, 0x45, 0x48, 0x49, 0x4A, 0x4B,
  0x60, 0x62, 0x67, 0x68, 0x69, 0x6A, 0x6B,
  0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
  0x88, 0x89, 0x8A, 0x8B, 0x8C, 0x8D, 0x8E, 0x8F,
]);

function findStartPosition(grid: CollisionGrid, startPos?: GridPos): GridPos {
  const row = Math.max(0, Math.min(GRID_SIZE - 1, startPos?.row ?? 32));
  const col = Math.max(0, Math.min(GRID_SIZE - 1, startPos?.col ?? 32));

  // Prefer local tiles first (requested tile + immediate neighbors), center-biased.
  const local: GridPos[] = [
    { row, col },
    { row, col: col + 1 },
    { row, col: col - 1 },
    { row: row + 1, col },
    { row: row - 1, col },
    { row: row + 1, col: col + 1 },
    { row: row + 1, col: col - 1 },
    { row: row - 1, col: col + 1 },
    { row: row - 1, col: col - 1 },
  ];
  for (const p of local) {
    if (p.row >= 0 && p.row < GRID_SIZE && p.col >= 0 && p.col < GRID_SIZE && grid.tiles[p.row][p.col].type === 'free') {
      return p;
    }
  }

  // Fallback: pick nearest free tile to the geometric center of Link's 2x2 footprint.
  const centerRow = row + 0.5;
  const centerCol = col + 0.5;
  let best: GridPos | null = null;
  let bestD2 = Number.POSITIVE_INFINITY;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid.tiles[r][c].type !== 'free') continue;
      const dr = r - centerRow;
      const dc = c - centerCol;
      const d2 = dr * dr + dc * dc;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = { row: r, col: c };
      }
    }
  }
  if (best) return best;

  return { row, col };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface FloodFillOptions {
  tileContext: TileAttrContext;
  inventory?: Set<TileReq>;
  startPos?: GridPos;
  dynamicBlockers?: GridPos[];
  entrances?: OverworldEntrance[];
  exitScreenByRoom?: Map<number, number>;
  variant?: ScreenVariant;
  /** Restrict BFS to a sub-region of the 64×64 grid (for multi-screen indoor rooms). */
  quadrantBounds?: QuadrantBounds;
  /** Both layer grids for indoor dual-layer rooms. Layer 0 has cliffs, layer 1 is under-bridge areas. */
  dualLayerGrids?: { layer0: number[][]; layer1: number[][] };
  /** Stair/transition tiles (where raw 0x1C appeared before normalization). Used as BFS seeds for layer1. */
  stairTiles?: Array<{ row: number; col: number }>;
  /** Override start layer (from live game state). Only used when both layers passable at start. */
  startLayer?: 0 | 1;
}

/**
 * Run flood fill on a single screen.
 *
 * @param rawAttrGrid  64×64 collision attribute grid (primary layer for indoor, full for overworld)
 * @param screenIndex  Screen/room index (for entrance filtering)
 * @param options      Configuration for the flood fill
 */
export function floodFillScreen(
  rawAttrGrid: number[][],
  screenIndex: number,
  options: FloodFillOptions,
): FloodFillResult {
  const {
    tileContext,
    inventory,
    startPos,
    dynamicBlockers,
    entrances = [],
    exitScreenByRoom,
    variant,
    quadrantBounds,
  } = options;

  const isIndoors = tileContext !== 'overworld';

  // Dual-layer BFS is disabled: layer 1 is too sparse to constrain movement
  // independently, so BFS escapes via stair tiles and floods everywhere.
  // Instead, always merge layers (union of walls) for proper offline BFS.
  const isDualLayer = false;

  // Always merge layers for BFS
  let layer0Grid: CollisionGrid | undefined;
  let ledges: LedgeTraversal[] = [];
  let dynamicBlockerCells: GridPos[] = [];
  let bothLayersPassable: boolean[][] | undefined;

  {
    // For indoor rooms with both grids available, merge layer 1's walls into layer 0.
    // Layer 1 has structural wall data (pillars, boundaries) that constrain the room.
    // Tiles where layer 1 has a non-zero non-passable attr should be blocked even if
    // layer 0 says ground (0x00).
    let mergedGrid = rawAttrGrid;
    if (isIndoors && options.dualLayerGrids) {
      const { layer0, layer1 } = options.dualLayerGrids;
      mergedGrid = Array.from({ length: GRID_SIZE }, (_, r) =>
        Array.from({ length: GRID_SIZE }, (_, c) => {
          const a0 = layer0[r][c];
          const a1 = layer1[r][c];
          // If layer 0 is passable but layer 1 has a non-zero wall attr, use layer 1's wall
          if (a1 !== 0x00 && PASSABLE_ATTRS.has(a0) && !PASSABLE_ATTRS.has(a1)) {
            return a1;
          }
          return a0;
        }),
      );
      // Compute bothLayersPassable for display (tiles walkable on both levels)
      bothLayersPassable = Array.from({ length: GRID_SIZE }, (_, r) =>
        Array.from({ length: GRID_SIZE }, (_, c) =>
          PASSABLE_ATTRS.has(layer0[r][c]) && PASSABLE_ATTRS.has(layer1[r][c])
        ),
      );
    }
    const prep = prepareScreen(mergedGrid, tileContext, dynamicBlockers);
    ledges = prep.ledges;
    dynamicBlockerCells = prep.dynamicBlockerCells;
    layer0Grid = prep.grid;
  }

  const grid = layer0Grid!;

  // Determine entrance positions (from the starting layer's grid)
  let screenEntrances: OverworldEntrance[];
  let entrancePositions: { row: number; col: number; idx: number }[];

  if (tileContext === 'overworld') {
    screenEntrances = entrances.filter(e => e.area === screenIndex);
    entrancePositions = screenEntrances.map(e => ({ row: e.gridRow, col: e.gridCol, idx: e.id }));
  } else {
    // Interior rooms: detect entrance/staircase tiles from the attr grid.
    // 0x8E/0x8F are TileBehavior_Entrance tiles (stairs between rooms/floors).
    screenEntrances = [];
    entrancePositions = [];
    const entranceTiles: GridPos[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const attr = grid.rawAttr[r][c];
        if (attr === 0x8E || attr === 0x8F) {
          entranceTiles.push({ row: r, col: c });
        }
      }
    }
    // Also check both layers for entrances when dual-layer data is available
    if (options.dualLayerGrids) {
      const { layer0, layer1 } = options.dualLayerGrids;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const a0 = layer0[r][c];
          const a1 = layer1[r][c];
          if ((a0 === 0x8E || a0 === 0x8F || a1 === 0x8E || a1 === 0x8F) &&
              !entranceTiles.some(t => t.row === r && t.col === c)) {
            entranceTiles.push({ row: r, col: c });
          }
        }
      }
    }
    // Cluster entrance tiles: merge any tiles within 4 sub-tiles of each other
    const clustered = new Set<number>();
    let syntheticIdx = 1000;
    for (let i = 0; i < entranceTiles.length; i++) {
      if (clustered.has(i)) continue;
      const cluster: GridPos[] = [entranceTiles[i]];
      clustered.add(i);
      for (let qi = 0; qi < cluster.length; qi++) {
        const cur = cluster[qi];
        for (let j = i + 1; j < entranceTiles.length; j++) {
          if (clustered.has(j)) continue;
          const other = entranceTiles[j];
          if (Math.abs(cur.row - other.row) <= 4 && Math.abs(cur.col - other.col) <= 4) {
            clustered.add(j);
            cluster.push(other);
          }
        }
      }
      const avgRow = Math.round(cluster.reduce((s, p) => s + p.row, 0) / cluster.length);
      const minCol = Math.min(...cluster.map(p => p.col));
      const id = syntheticIdx++;
      const exitScreen = exitScreenByRoom?.get(screenIndex) ?? 0;
      screenEntrances.push({ area: exitScreen, pos: 0, id, gridRow: avgRow, gridCol: minCol, roomId: screenIndex });
      entrancePositions.push({ row: avgRow, col: minCol, idx: id });
    }
  }

  const start = findStartPosition(grid, startPos);
  const inv = inventory ?? new Set<TileReq>();

  // Single-layer BFS (merged grid handles both layers)
  const bfsResult = floodFillBFS(
    grid.tiles, start.row, start.col, entrancePositions, inv, grid.rawAttr, tileContext,
    undefined, quadrantBounds,
  );
  const reachable = bfsResult.reachable;
  const transitions = bfsResult.transitions;
  const reachableCount = bfsResult.reachableCount;
  const reqGrid = bfsResult.reqGrid;
  const hookTargets = bfsResult.hookTargets;
  const tileLayer: (0 | 1 | 2)[][] | undefined = undefined;

  // Compute layer1 reachability: only tiles inside ENCLOSED regions (real upper floor).
  // Void areas on BG1 (layer1) default to 0x00 and extend to room boundaries.
  // Real upper-floor content is enclosed by walls and does NOT touch the grid edge.
  // We flood through 0x00 tiles only — other passable attrs (ledges, stairs) can bridge
  // enclosed areas to the boundary, but 0x00-only connectivity correctly separates
  // real ground from void.
  let layer1Reachable: boolean[][] | undefined;
  if (isIndoors && options.dualLayerGrids) {
    const { layer1 } = options.dualLayerGrids;
    layer1Reachable = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
    const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (visited[r][c]) continue;
        if (layer1[r][c] !== 0x00) { visited[r][c] = true; continue; }

        // BFS to find the connected component of 0x00 tiles on layer1
        const component: GridPos[] = [];
        const queue: GridPos[] = [{ row: r, col: c }];
        visited[r][c] = true;
        let touchesBoundary = false;

        while (queue.length > 0) {
          const { row: qr, col: qc } = queue.shift()!;
          component.push({ row: qr, col: qc });
          if (qr === 0 || qr === GRID_SIZE - 1 || qc === 0 || qc === GRID_SIZE - 1) {
            touchesBoundary = true;
          }
          for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
            const nr = qr + dr, nc = qc + dc;
            if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
            if (visited[nr][nc]) continue;
            if (layer1[nr][nc] !== 0x00) continue;
            visited[nr][nc] = true;
            queue.push({ row: nr, col: nc });
          }
        }

        // Enclosed components (don't touch boundary) are real upper-floor ground.
        // Boundary-touching components are void/filler.
        if (!touchesBoundary) {
          for (const pos of component) {
            layer1Reachable[pos.row][pos.col] = true;
          }
        }
      }
    }
  }

  // Filter ledges to only reachable ones
  const reachableLedges = ledges.filter(l => reachable[l.startRow]?.[l.startCol]);

  // Summarize borders (interior rooms don't have border transitions)
  const borders: FloodFillResult['borders'] = {
    north: { freeTiles: [], itemTiles: [] },
    south: { freeTiles: [], itemTiles: [] },
    east: { freeTiles: [], itemTiles: [] },
    west: { freeTiles: [], itemTiles: [] },
  };

  for (const t of transitions) {
    if (t.edge === 'entrance') continue;
    // Skip traversal-only tiles (uncontrolled movement) from border connections
    if (reachable[t.row][t.col] >= 2) continue;
    // Skip door/entrance tiles (0x80-0x8F) at the actual room edge — those are entrance
    // transitions, not scroll borders. But allow them at quadrant boundaries (intra-room).
    const attr = grid.rawAttr[t.row]?.[t.col] ?? 0;
    const isAtRoomEdge = t.row === 0 || t.row === GRID_SIZE - 1 || t.col === 0 || t.col === GRID_SIZE - 1;
    if (attr >= 0x80 && attr <= 0x8F && isAtRoomEdge) continue;
    const pos = t.edge === 'north' || t.edge === 'south' ? t.col : t.row;
    const unmet = unmetRequirements(t.requirements, inv);
    if (unmet.length === 0) {
      borders[t.edge].freeTiles.push(pos);
    } else {
      borders[t.edge].itemTiles.push({ pos, requirements: unmet });
    }
  }

  return {
    screenIndex,
    tileContext,
    startPos: start,
    reachable,
    transitions,
    reachableCount,
    totalTiles: quadrantBounds
      ? (quadrantBounds.maxRow - quadrantBounds.minRow + 1) * (quadrantBounds.maxCol - quadrantBounds.minCol + 1)
      : GRID_SIZE * GRID_SIZE,
    entrances: screenEntrances,
    ledges: reachableLedges,
    hookTargets,
    attrGrid: grid.rawAttr,
    reqGrid,
    dynamicBlockerCells,
    borders,
    variant,
    tileLayer,
    bothLayersPassable,
    layer1Reachable,
    dualLayerGrids: options.dualLayerGrids,
  };
}

// ─── Connection Helpers ──────────────────────────────────────────────────────

import type { ConnectionInfo } from '../types';

/** Get adjacent room for indoor rooms (16-wide grid, 20 rows). */
function getAdjacentRoom(roomIdx: number, edge: 'north' | 'south' | 'east' | 'west'): number | null {
  const col = roomIdx % 16;
  const row = Math.floor(roomIdx / 16);
  switch (edge) {
    case 'north': return row > 0 ? roomIdx - 16 : null;
    case 'south': return row < 19 ? roomIdx + 16 : null;
    case 'west': return col > 0 ? roomIdx - 1 : null;
    case 'east': return col < 15 ? roomIdx + 1 : null;
  }
}

/** Extract border connection info from a flood fill result. */
export function getConnections(result: FloodFillResult, intraEdges?: ('north' | 'south' | 'east' | 'west')[]): ConnectionInfo[] {
  const connections: ConnectionInfo[] = [];
  const edges: ('north' | 'south' | 'east' | 'west')[] = ['north', 'south', 'east', 'west'];
  const isIndoor = result.tileContext !== 'overworld';
  const intraSet = new Set(intraEdges ?? []);

  for (const edge of edges) {
    const border = result.borders[edge];
    const totalTiles = border.freeTiles.length + border.itemTiles.length;
    if (totalTiles === 0) continue;

    const isIntra = intraSet.has(edge);
    // For intra-room edges, target is the same room (other quadrant).
    const targetScreen = isIntra
      ? result.screenIndex
      : isIndoor
        ? getAdjacentRoom(result.screenIndex, edge)
        : getAdjacentScreen(result.screenIndex, edge);
    if (targetScreen === null) continue;

    const allPositions = [...border.freeTiles, ...border.itemTiles.map(t => t.pos)].sort((a, b) => a - b);
    const allReqs = new Set<string>();
    for (const t of border.itemTiles) t.requirements.forEach(r => allReqs.add(r));

    // Split into contiguous runs so blocked gaps produce separate connections
    const itemPosSet = new Set(border.itemTiles.map(t => t.pos));
    let bundleStart = 0;
    for (let i = 1; i <= allPositions.length; i++) {
      if (i === allPositions.length || allPositions[i] !== allPositions[i - 1] + 1) {
        const bundlePositions = allPositions.slice(bundleStart, i);
        const bundleFree = bundlePositions.filter(p => !itemPosSet.has(p)).length;
        const bundleItem = bundlePositions.length - bundleFree;
        connections.push({
          edge,
          targetScreen,
          isIntraRoom: isIntra || undefined,
          freeTileCount: bundleFree,
          itemTileCount: bundleItem,
          positions: bundlePositions,
          requirements: [...allReqs],
        });
        bundleStart = i;
      }
    }
  }

  return connections;
}
