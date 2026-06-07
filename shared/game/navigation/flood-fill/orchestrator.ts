/* @layer shared-game @kind logic */
import type {
  FloodFillResult, OverworldEntrance, LedgeTraversal,
  GridPos, CollisionGrid, ScreenVariant, ReachState, TransitionPoint,
} from '../types';
import type { TileAttrContext } from '../tile-attrs';
import type { TileReq } from '../tile-attrs';
import { GRID_SIZE } from '../types';
import { unmetRequirements } from '../core/inventory';
import { getAdjacentScreen } from '../core/grid-utils';
import { runBFS } from '../core/bfs-engine';
import { buildCollisionGridFromRawAttr } from '../screen-data/collision-grid';
import { processStraightCliffs, processDiagonalCliffs, processSouthCliffs } from '../screen-data/cliff-preprocessing';
import { SingleLayerStrategy } from '../strategies/single-layer';
import { DualLayerStrategy } from '../strategies/dual-layer';
import type { QuadrantBounds } from '../strategies/layer-strategy';

// ─── Screen Preparation ──────────────────────────────────────────────────────

const prepareScreen = (rawAttrGrid: number[][], tileContext: TileAttrContext, dynamicBlockers?: GridPos[], skipCliffs = false): { grid: CollisionGrid; ledges: LedgeTraversal[]; dynamicBlockerCells: GridPos[] } => {
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
  } else {
    // On layer 1 (lower floor), cliff-trigger tiles are normal ground.
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const attr = grid.rawAttr[r][c];
        if (attr >= 0x28 && attr <= 0x2B) {
          grid.tiles[r][c] = { type: 'free' };
        }
      }
    }
  }

  return { grid, ledges, dynamicBlockerCells };
};

const constrainVoidTiles = (thisLayer: number[][], _otherLayer: number[][]): number[][] => {
  // Step 1: Flood from boundary through 0x00 tiles to find void-connected regions
  const isVoid: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  const queue: Array<[number, number]> = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if ((r === 0 || r === GRID_SIZE - 1 || c === 0 || c === GRID_SIZE - 1) && thisLayer[r][c] === 0x00) {
        isVoid[r][c] = true;
        queue.push([r, c]);
      }
    }
  }
  while (queue.length > 0) {
    const [qr, qc] = queue.shift()!;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nr = qr + dr, nc = qc + dc;
      if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
      if (isVoid[nr][nc]) continue;
      if (thisLayer[nr][nc] !== 0x00) continue;
      isVoid[nr][nc] = true;
      queue.push([nr, nc]);
    }
  }

  // Step 2: Copy grid, replacing void tiles with solid wall (0x01)
  return Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) =>
      isVoid[r][c] ? 0x01 : thisLayer[r][c]
    ),
  );
};

const findStartPosition = (grid: CollisionGrid, startPos?: GridPos): GridPos => {
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
};

// ─── Public API ──────────────────────────────────────────────────────────────

interface FloodFillOptions {
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
  /** kind_of_in_room_staircase value. When 2, layer changes are blocked — force single-layer BFS on startLayer. */
  staircaseType?: number;
  /** Additional seed positions for BFS (used when propagating from adjacent screens). */
  extraSeeds?: GridPos[];
}

const floodFillScreen = (rawAttrGrid: number[][], screenIndex: number, options: FloodFillOptions): FloodFillResult => {
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

  // Build collision grid(s) and run BFS
  let grid: CollisionGrid;
  let ledges: LedgeTraversal[] = [];
  let dynamicBlockerCells: GridPos[] = [];
  let reachable: ReachState[][];
  let transitions: TransitionPoint[];
  let reachableCount: number;
  let reqGrid: string[][] | undefined;
  let hookTargets: GridPos[] | undefined;
  let tileLayer: (0 | 1 | 2)[][] | undefined;
  let reachableByLayer: [ReachState[][], ReachState[][]] | undefined;

  // staircaseType 2 = layer changes blocked. Force single-layer BFS on the starting layer only.
  const layerBlocked = options.staircaseType === 2;
  const useDualLayer = isIndoors && !!options.dualLayerGrids && !layerBlocked;

  if (useDualLayer) {
    const { layer0, layer1 } = options.dualLayerGrids!;

    // Mark boundary-connected void as blocked on each layer.
    // In dungeon rooms, 0x00 on a layer means either "real ground" or "structural void"
    // (empty space belonging to the other layer). Void regions always touch the grid edge.
    // Real ground is enclosed by walls on that layer.
    const constrainedLayer0 = constrainVoidTiles(layer0, layer1);
    const constrainedLayer1 = constrainVoidTiles(layer1, layer0);

    // Build separate collision grids for each layer
    const prep0 = prepareScreen(constrainedLayer0, tileContext, dynamicBlockers, false);
    const prep1 = prepareScreen(constrainedLayer1, tileContext, dynamicBlockers, true); // skip cliffs on layer 1

    grid = prep0.grid;
    ledges = prep0.ledges;
    dynamicBlockerCells = prep0.dynamicBlockerCells;

    const startLayer = options.startLayer ?? 0;
    const startGrid = startLayer === 0 ? prep0.grid : prep1.grid;
    const start = findStartPosition(startGrid, startPos);

    const inv = inventory ?? new Set<TileReq>();

    // Determine entrance positions before BFS (needed by both paths)
    const { screenEntrances: sEnts, entrancePositions: ePos } = findEntrancePositions(
      tileContext, entrances, screenIndex,
    );

    const bfsBounds: QuadrantBounds = quadrantBounds ?? { minRow: 0, maxRow: GRID_SIZE - 1, minCol: 0, maxCol: GRID_SIZE - 1 };
    const strategy = new DualLayerStrategy(
      [prep0.grid.tiles, prep1.grid.tiles],
      [prep0.grid.rawAttr, prep1.grid.rawAttr],
      tileContext,
      startLayer,
    );

    const bfsResult = runBFS(strategy, start.row, start.col, ePos, inv, bfsBounds, options.extraSeeds);

    reachable = bfsResult.reachable;
    transitions = bfsResult.transitions;
    reachableCount = bfsResult.reachableCount;
    reqGrid = bfsResult.reqGrid;
    hookTargets = bfsResult.hookTargets;
    tileLayer = bfsResult.tileLayer;
    reachableByLayer = bfsResult.reachableByLayer;

    // Filter ledges: show arrow only if the approach tile is reachable on layer 0.
    // Ledges only function on the upper layer; layer 1 reachability is irrelevant.
    const layer0Reach = bfsResult.reachableByLayer![0];
    const reachableLedges = ledges.filter(l => {
      const dr = Math.sign(l.endRow - l.startRow);
      const dc = Math.sign(l.endCol - l.startCol);
      const approachRow = l.startRow - dr;
      const approachCol = l.startCol - dc;
      return layer0Reach[approachRow]?.[approachCol] != null && layer0Reach[approachRow][approachCol] !== 0;
    });
    const borders = buildBorders(transitions, reachable, grid, inv, quadrantBounds);

    return {
      screenIndex, tileContext, startPos: start,
      reachable, transitions, reachableCount,
      totalTiles: quadrantBounds
        ? (quadrantBounds.maxRow - quadrantBounds.minRow + 1) * (quadrantBounds.maxCol - quadrantBounds.minCol + 1)
        : GRID_SIZE * GRID_SIZE,
      entrances: sEnts, ledges: reachableLedges, hookTargets,
      attrGrid: grid.rawAttr, reqGrid, dynamicBlockerCells, borders, variant,
      tileLayer, reachableByLayer, dualLayerGrids: options.dualLayerGrids,
      staircaseType: options.staircaseType, startLayer: options.startLayer,
    };
  }

  // ─── Single-layer path (overworld or rooms without dual-layer data) ─────────
  {
    // When layer changes are blocked (staircaseType 2) but dual grids exist,
    // use the starting layer's grid instead of the raw attr grid.
    const singleLayerGrid = layerBlocked && options.dualLayerGrids
      ? (options.startLayer === 1 ? options.dualLayerGrids.layer1 : options.dualLayerGrids.layer0)
      : rawAttrGrid;
    const prep = prepareScreen(singleLayerGrid, tileContext, dynamicBlockers);
    grid = prep.grid;
    ledges = prep.ledges;
    dynamicBlockerCells = prep.dynamicBlockerCells;
  }

  // Determine entrance positions (from the starting layer's grid)
  const { screenEntrances, entrancePositions } = findEntrancePositions(
    tileContext, entrances, screenIndex,
  );

  const start = findStartPosition(grid, startPos);
  const inv = inventory ?? new Set<TileReq>();

  // Single-layer BFS (using unified engine with SingleLayerStrategy)
  const singleBounds: QuadrantBounds = quadrantBounds ?? { minRow: 0, maxRow: GRID_SIZE - 1, minCol: 0, maxCol: GRID_SIZE - 1 };
  const strategy = new SingleLayerStrategy(grid.tiles, grid.rawAttr, tileContext);
  const bfsResult = runBFS(strategy, start.row, start.col, entrancePositions, inv, singleBounds, options.extraSeeds);

  // Filter ledges to only reachable ones
  const reachableLedges = ledges.filter(l => bfsResult.reachable[l.startRow]?.[l.startCol]);
  const borders = buildBorders(bfsResult.transitions, bfsResult.reachable, grid, inv, quadrantBounds);

  return {
    screenIndex, tileContext, startPos: start,
    reachable: bfsResult.reachable,
    transitions: bfsResult.transitions,
    reachableCount: bfsResult.reachableCount,
    totalTiles: quadrantBounds
      ? (quadrantBounds.maxRow - quadrantBounds.minRow + 1) * (quadrantBounds.maxCol - quadrantBounds.minCol + 1)
      : GRID_SIZE * GRID_SIZE,
    entrances: screenEntrances, ledges: reachableLedges,
    hookTargets: bfsResult.hookTargets,
    attrGrid: grid.rawAttr, reqGrid: bfsResult.reqGrid,
    dynamicBlockerCells, borders, variant,
    dualLayerGrids: options.dualLayerGrids,
    staircaseType: options.staircaseType, startLayer: options.startLayer,
  };
};

// ─── Extracted Helpers ───────────────────────────────────────────────────────

const findEntrancePositions = (tileContext: TileAttrContext, entrances: OverworldEntrance[], screenIndex: number): { screenEntrances: OverworldEntrance[]; entrancePositions: { row: number; col: number; idx: number }[] } => {
  if (tileContext === 'overworld') {
    const screenEntrances = entrances.filter(e => e.area === screenIndex);
    const entrancePositions = screenEntrances.map(e => ({ row: e.gridRow, col: e.gridCol, idx: e.id }));
    return { screenEntrances, entrancePositions };
  }

  // Interior rooms: filter entrances physically placed in this room (area === screenIndex).
  // The widget adds indoor spawn positions and stairs with area = roomIndex.
  const screenEntrances = entrances.filter(e => e.area === screenIndex);
  const entrancePositions = screenEntrances.map(e => ({ row: e.gridRow, col: e.gridCol, idx: e.id }));
  return { screenEntrances, entrancePositions };
};

const buildBorders = (transitions: TransitionPoint[], reachable: ReachState[][], grid: CollisionGrid, inv: Set<TileReq>, quadrantBounds?: QuadrantBounds): FloodFillResult['borders'] => {
  const borders: FloodFillResult['borders'] = {
    north: { freeTiles: [], itemTiles: [] },
    south: { freeTiles: [], itemTiles: [] },
    east: { freeTiles: [], itemTiles: [] },
    west: { freeTiles: [], itemTiles: [] },
  };

  for (const t of transitions) {
    if (t.edge === 'entrance') continue;
    if (reachable[t.row][t.col] >= 2) continue;
    const attr = grid.rawAttr[t.row]?.[t.col] ?? 0;
    // Door passage tiles (0x80-0x8F) at room edges are valid inter-room transitions.
    // BFS doesn't propagate past the grid boundary — these just get reported as exits.
    const pos = t.edge === 'north' || t.edge === 'south' ? t.col : t.row;
    const unmet = unmetRequirements(t.requirements, inv);
    if (unmet.length === 0) {
      borders[t.edge].freeTiles.push(pos);
    } else {
      borders[t.edge].itemTiles.push({ pos, requirements: unmet });
    }
  }
  return borders;
};

// ─── Connection Helpers ──────────────────────────────────────────────────────

import type { ConnectionInfo } from '../types';

const getAdjacentRoom = (roomIdx: number, edge: 'north' | 'south' | 'east' | 'west'): number | null => {
  const col = roomIdx % 16;
  const row = Math.floor(roomIdx / 16);
  switch (edge) {
    case 'north': return row > 0 ? roomIdx - 16 : null;
    case 'south': return row < 19 ? roomIdx + 16 : null;
    case 'west': return col > 0 ? roomIdx - 1 : null;
    case 'east': return col < 15 ? roomIdx + 1 : null;
  }
};

const getConnections = (result: FloodFillResult, intraEdges?: ('north' | 'south' | 'east' | 'west')[]): ConnectionInfo[] => {
  const connections: ConnectionInfo[] = [];
  const edges: ('north' | 'south' | 'east' | 'west')[] = ['north', 'south', 'east', 'west'];
  const isIndoor = result.tileContext !== 'overworld';
  const intraSet = new Set(intraEdges ?? []);

  // Expand intra edges to include both sides of each boundary.
  // e.g. 'south' (upper→lower) implies 'north' (lower→upper) for the same boundary.
  const opposites: Record<string, 'north' | 'south' | 'east' | 'west'> = { north: 'south', south: 'north', east: 'west', west: 'east' };
  for (const e of intraEdges ?? []) intraSet.add(opposites[e]);

  for (const edge of edges) {
    const isIntra = intraSet.has(edge);

    if (isIntra) {
      // Intra-room edges: scan the reachable grid at the scroll boundary (row 31↔32 or col 31↔32).
      // BFS doesn't produce transitions here — these are internal crossings.
      const positions: number[] = [];
      const reachable = result.reachable;
      if (edge === 'south' || edge === 'north') {
        // Horizontal boundary at row 31/32
        for (let col = 0; col < GRID_SIZE; col++) {
          if (reachable[31]?.[col] && reachable[32]?.[col]) {
            positions.push(col);
          }
        }
      } else {
        // Vertical boundary at col 31/32
        for (let row = 0; row < GRID_SIZE; row++) {
          if (reachable[row]?.[31] && reachable[row]?.[32]) {
            positions.push(row);
          }
        }
      }
      if (positions.length === 0) continue;

      // Split into contiguous runs
      let bundleStart = 0;
      for (let i = 1; i <= positions.length; i++) {
        if (i === positions.length || positions[i] !== positions[i - 1] + 1) {
          const bundlePositions = positions.slice(bundleStart, i);
          connections.push({
            edge,
            targetScreen: result.screenIndex,
            isIntraRoom: true,
            freeTileCount: bundlePositions.length,
            itemTileCount: 0,
            positions: bundlePositions,
            requirements: [],
          });
          bundleStart = i;
        }
      }
    } else {
      const border = result.borders[edge];
      const totalTiles = border.freeTiles.length + border.itemTiles.length;
      if (totalTiles === 0) continue;

      const targetScreen = isIndoor
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
            freeTileCount: bundleFree,
            itemTileCount: bundleItem,
            positions: bundlePositions,
            requirements: [...allReqs],
          });
          bundleStart = i;
        }
      }
    }
  }

  return connections;
};

export { floodFillScreen, getConnections };
export type { FloodFillOptions };
