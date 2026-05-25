import type { RomData } from '../../../asset-extraction/rom/rom-types';
import type {
  FloodFillResult, OverworldEntrance, LedgeTraversal,
  EngineCache, GridPos, CollisionGrid,
} from '../types';
import { GRID_SIZE } from '../types';
import { unmetRequirements } from '../core/inventory';
import {
  loadMap32Tables, loadMap16ToMap8, loadMap8ToAttr, decompressScreen,
  ADDR_OW_ENTRANCE_AREA, ADDR_OW_ENTRANCE_POS, ADDR_OW_ENTRANCE_ID, ADDR_ENTRANCE_ROOM,
} from '../screen-data';
import { buildCollisionGrid } from '../screen-data/collision-grid';
import { processStraightCliffs, processDiagonalCliffs, processSouthCliffs } from '../screen-data/cliff-preprocessing';
import { floodFillBFS } from './single-screen';

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

function prepareScreen(rom: RomData, screenIndex: number): { grid: CollisionGrid; ledges: LedgeTraversal[] } {
  const engine = getEngine(rom);
  const map16 = decompressScreen(rom, screenIndex, engine.map32);
  const grid = buildCollisionGrid(map16, engine.map16ToMap8, engine.map8ToAttr);

  const ledges: LedgeTraversal[] = [];
  processStraightCliffs(grid.tiles, grid.rawAttr, ledges);
  processDiagonalCliffs(grid.tiles, grid.rawAttr, ledges);
  processSouthCliffs(grid.tiles, grid.rawAttr, ledges);

  return { grid, ledges };
}

function findStartPosition(grid: CollisionGrid, startPos?: GridPos): GridPos {
  const row = startPos?.row ?? 32;
  const col = startPos?.col ?? 32;

  if (grid.tiles[row]?.[col]?.type === 'free') return { row, col };

  // Spiral search outward from the requested position
  for (let radius = 1; radius < GRID_SIZE; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue; // only perimeter
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && grid.tiles[r][c].type === 'free') {
          return { row: r, col: c };
        }
      }
    }
  }
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
): FloodFillResult {
  const engine = getEngine(rom);
  const { grid, ledges } = prepareScreen(rom, screenIndex);

  const screenEntrances = engine.entrances.filter(e => (e.area & 0x3f) === (screenIndex & 0x3f));
  const entrancePositions = screenEntrances.map(e => ({ row: e.gridRow, col: e.gridCol, idx: e.id }));

  const start = findStartPosition(grid, startPos);
  const inv = inventory ?? new Set<string>();

  const { reachable, transitions, reachableCount, reqGrid } = floodFillBFS(
    grid.tiles, start.row, start.col, entrancePositions, inv,
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
    reachable,
    transitions,
    reachableCount,
    totalTiles: GRID_SIZE * GRID_SIZE,
    entrances: screenEntrances,
    ledges: reachableLedges,
    attrGrid: grid.rawAttr,
    reqGrid,
    borders,
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
