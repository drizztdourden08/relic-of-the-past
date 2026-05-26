import type { RomData } from '../../../asset-extraction/rom/rom-types';
import type {
  FloodFillResult, OverworldEntrance, LedgeTraversal,
  EngineCache, GridPos, CollisionGrid, ScreenVariant,
} from '../types';
import type { TileAttrContext } from '../tile-attrs';
import { GRID_SIZE } from '../types';
import { unmetRequirements } from '../core/inventory';
import {
  loadMap32Tables, loadMap16ToMap8, loadMap8ToAttr, decompressScreen,
  ADDR_OW_ENTRANCE_AREA, ADDR_OW_ENTRANCE_POS, ADDR_OW_ENTRANCE_ID, ADDR_ENTRANCE_ROOM,
} from '../screen-data';
import { buildCollisionGrid, buildCollisionGridFromRawAttr } from '../screen-data/collision-grid';
import { processStraightCliffs, processDiagonalCliffs, processSouthCliffs } from '../screen-data/cliff-preprocessing';
import { floodFillBFS } from './single-screen';
import { getOverlayPatches, type VariantState } from '../screen-data/event-overlays';

// ─── Engine Cache ────────────────────────────────────────────────────────────

let cachedEngine: EngineCache | null = null;

export function initEngine(rom: RomData): void {
  cachedEngine = {
    map32: loadMap32Tables(rom),
    map16ToMap8: loadMap16ToMap8(rom),
    map8ToAttr: loadMap8ToAttr(rom),
    entrances: loadOverworldEntrances(rom),
  };
}

function getEngine(rom: RomData): EngineCache {
  if (!cachedEngine) initEngine(rom);
  return cachedEngine!;
}

/** Expose entrances for route-planner location resolution. */
export function getEntrances(rom: RomData): OverworldEntrance[] {
  return getEngine(rom).entrances;
}

// ─── Entrance Loading ────────────────────────────────────────────────────────

function loadOverworldEntrances(rom: RomData): OverworldEntrance[] {
  const entrances: OverworldEntrance[] = [];
  for (let i = 0; i < 129; i++) {
    const area = rom.getWord(ADDR_OW_ENTRANCE_AREA + i * 2);
    const pos = rom.getWord(ADDR_OW_ENTRANCE_POS + i * 2);
    const id = rom.getByte(ADDR_OW_ENTRANCE_ID + i);
    const roomId = rom.getWord(ADDR_ENTRANCE_ROOM + id * 2);

    const map16Row = pos >> 7;
    const map16Col = (pos & 0x7F) >> 1;
    const gridRow = (map16Row % 32) * 2;
    const gridCol = (map16Col % 32) * 2;

    entrances.push({ area, pos, id, gridRow, gridCol, roomId });
  }
  return entrances;
}

// ─── Screen Preparation ──────────────────────────────────────────────────────

function prepareScreen(
  rom: RomData,
  screenIndex: number,
  variant?: ScreenVariant,
  tileContext: TileAttrContext = 'overworld',
  rawAttrOverride?: number[][],
  dynamicBlockers?: GridPos[],
): { grid: CollisionGrid; ledges: LedgeTraversal[]; dynamicBlockerCells: GridPos[] } {
  const engine = getEngine(rom);
  const dynamicBlockerCells: GridPos[] = [];

  const applyDynamicBlockers = (grid: CollisionGrid): void => {
    if (!dynamicBlockers?.length) return;
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
  };

  if (rawAttrOverride) {
    const grid = buildCollisionGridFromRawAttr(rawAttrOverride, tileContext);
    applyDynamicBlockers(grid);
    return { grid, ledges: [], dynamicBlockerCells };
  }

  const map16 = decompressScreen(rom, screenIndex, engine.map32);

  // Apply event overlay patches to the Map16 buffer before building collision grid
  if (variant) {
    const vs: VariantState = { eventFlags: variant.eventFlags };
    const patches = getOverlayPatches(screenIndex, vs);
    for (const p of patches) {
      map16[p.row * 32 + p.col] = p.tile;
    }
  }

  const grid = buildCollisionGrid(map16, engine.map16ToMap8, engine.map8ToAttr, tileContext);
  applyDynamicBlockers(grid);

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
  // This keeps fallback inside Link's body footprint before stepping outside.
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
  // This avoids external/top-left bias from directional spiral scans.
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

/**
 * Run flood fill on a single screen.
 * Entry point #1: single screen reachability analysis.
 */
export function floodFillScreen(
  rom: RomData,
  screenIndex: number,
  inventory?: Set<string>,
  startPos?: GridPos,
  variant?: ScreenVariant,
  tileContext: TileAttrContext = 'overworld',
  rawAttrOverride?: number[][],
  dynamicBlockers?: GridPos[],
): FloodFillResult {
  const engine = getEngine(rom);
  const { grid, ledges, dynamicBlockerCells } = prepareScreen(rom, screenIndex, variant, tileContext, rawAttrOverride, dynamicBlockers);

  // Only match entrances with exact area match.
  // (Areas 0x40+ are small-screen variants of 0x00-0x3F — don't merge them)
  const screenEntrances = engine.entrances.filter(e => e.area === screenIndex);
  const entrancePositions = screenEntrances.map(e => ({ row: e.gridRow, col: e.gridCol, idx: e.id }));

  const start = findStartPosition(grid, startPos);
  const inv = inventory ?? new Set<string>();

  const { reachable, transitions, reachableCount, reqGrid, hookTargets } = floodFillBFS(
    grid.tiles, start.row, start.col, entrancePositions, inv, grid.rawAttr, tileContext,
  );

  // Filter ledges to only reachable ones
  const reachableLedges = ledges.filter(l => reachable[l.startRow]?.[l.startCol]);

  // Summarize borders (filter out met requirements)
  const borders: FloodFillResult['borders'] = {
    north: { freeTiles: [], itemTiles: [] },
    south: { freeTiles: [], itemTiles: [] },
    east: { freeTiles: [], itemTiles: [] },
    west: { freeTiles: [], itemTiles: [] },
  };

  for (const t of transitions) {
    if (t.edge === 'entrance') continue;
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
import { getAdjacentScreen } from '../screen-hop';

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

    const allPositions = [...border.freeTiles, ...border.itemTiles.map(t => t.pos)];
    const allReqs = new Set<string>();
    for (const t of border.itemTiles) t.requirements.forEach(r => allReqs.add(r));

    connections.push({
      edge,
      targetScreen,
      freeTileCount: border.freeTiles.length,
      itemTileCount: border.itemTiles.length,
      positions: allPositions.sort((a, b) => a - b),
      requirements: [...allReqs],
    });
  }

  return connections;
}
