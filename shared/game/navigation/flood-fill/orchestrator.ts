import type {
  FloodFillResult, OverworldEntrance, LedgeTraversal,
  GridPos, CollisionGrid, ScreenVariant,
} from '../types';
import type { TileAttrContext } from '../tile-attrs';
import type { TileReq } from '../tile-attrs';
import { GRID_SIZE } from '../types';
import { unmetRequirements } from '../core/inventory';
import { getAdjacentScreen } from '../core/grid-utils';
import { buildCollisionGridFromRawAttr } from '../screen-data/collision-grid';
import { processStraightCliffs, processDiagonalCliffs, processSouthCliffs } from '../screen-data/cliff-preprocessing';
import { floodFillBFS } from './single-screen';

// ─── Screen Preparation ──────────────────────────────────────────────────────

function prepareScreen(
  rawAttrGrid: number[][],
  tileContext: TileAttrContext,
  dynamicBlockers?: GridPos[],
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

  // Cliff preprocessing (ledge one-way traversals)
  const ledges: LedgeTraversal[] = [];
  processStraightCliffs(grid.tiles, grid.rawAttr, ledges);
  processDiagonalCliffs(grid.tiles, grid.rawAttr, ledges);
  processSouthCliffs(grid.tiles, grid.rawAttr, ledges);

  return { grid, ledges, dynamicBlockerCells };
}

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
}

/**
 * Run flood fill on a single screen.
 *
 * @param rawAttrGrid  64×64 collision attribute grid (from WASM)
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
  } = options;

  const { grid, ledges, dynamicBlockerCells } = prepareScreen(rawAttrGrid, tileContext, dynamicBlockers);

  // Determine entrance positions
  let screenEntrances: OverworldEntrance[];
  let entrancePositions: { row: number; col: number; idx: number }[];

  if (tileContext === 'overworld') {
    screenEntrances = entrances.filter(e => e.area === screenIndex);
    entrancePositions = screenEntrances.map(e => ({ row: e.gridRow, col: e.gridCol, idx: e.id }));
  } else {
    // Interior rooms: detect door/entrance/staircase tiles from the attr grid.
    // 0x80-0x8D are door passage tiles (stamped by Dungeon_LoadDoorAttribute).
    // 0x8E/0x8F are TileBehavior_Entrance tiles (stairs between rooms/floors).
    screenEntrances = [];
    entrancePositions = [];
    const entranceTiles: GridPos[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const attr = grid.rawAttr[r][c];
        if (attr >= 0x80 && attr <= 0x8F) {
          entranceTiles.push({ row: r, col: c });
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
      const minCol = Math.min(...cluster.map(p => p.col)) - 1;
      const id = syntheticIdx++;
      const exitScreen = exitScreenByRoom?.get(screenIndex) ?? 0;
      screenEntrances.push({ area: exitScreen, pos: 0, id, gridRow: avgRow, gridCol: minCol, roomId: screenIndex });
      entrancePositions.push({ row: avgRow, col: minCol, idx: id });
    }
  }

  const start = findStartPosition(grid, startPos);
  const inv = inventory ?? new Set<TileReq>();

  const { reachable, transitions, reachableCount, reqGrid, hookTargets } = floodFillBFS(
    grid.tiles, start.row, start.col, entrancePositions, inv, grid.rawAttr, tileContext,
  );

  // Filter ledges to only reachable ones
  const reachableLedges = ledges.filter(l => reachable[l.startRow]?.[l.startCol]);

  // Summarize borders (interior rooms don't have border transitions)
  const borders: FloodFillResult['borders'] = {
    north: { freeTiles: [], itemTiles: [] },
    south: { freeTiles: [], itemTiles: [] },
    east: { freeTiles: [], itemTiles: [] },
    west: { freeTiles: [], itemTiles: [] },
  };

  if (tileContext === 'overworld') {
    for (const t of transitions) {
      if (t.edge === 'entrance') continue;
      // Skip traversal-only tiles (uncontrolled movement) from border connections
      if (reachable[t.row][t.col] >= 2) continue;
      const pos = t.edge === 'north' || t.edge === 'south' ? t.col : t.row;
      const unmet = unmetRequirements(t.requirements, inv);
      if (unmet.length === 0) {
        borders[t.edge].freeTiles.push(pos);
      } else {
        borders[t.edge].itemTiles.push({ pos, requirements: unmet });
      }
    }
  }

  return {
    screenIndex,
    tileContext,
    startPos: start,
    reachable,
    transitions,
    reachableCount,
    totalTiles: GRID_SIZE * GRID_SIZE,
    entrances: screenEntrances,
    ledges: reachableLedges,
    hookTargets,
    attrGrid: grid.rawAttr,
    reqGrid,
    dynamicBlockerCells,
    borders,
    variant,
  };
}

// ─── Connection Helpers ──────────────────────────────────────────────────────

import type { ConnectionInfo } from '../types';



/** Extract border connection info from a flood fill result. */
export function getConnections(result: FloodFillResult): ConnectionInfo[] {
  const connections: ConnectionInfo[] = [];
  const edges: ('north' | 'south' | 'east' | 'west')[] = ['north', 'south', 'east', 'west'];

  for (const edge of edges) {
    const border = result.borders[edge];
    const totalTiles = border.freeTiles.length + border.itemTiles.length;
    if (totalTiles === 0) continue;

    const targetScreen = getAdjacentScreen(result.screenIndex, edge);
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

  return connections;
}
