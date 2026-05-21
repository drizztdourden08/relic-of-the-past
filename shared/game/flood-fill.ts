/**
 * Overworld flood-fill connectivity engine.
 *
 * BFS pathfinding from a starting position to discover reachable
 * screen borders and entrances, with item requirement tracking.
 *
 * Used by both the CLI extraction script and the in-app Connection Debug panel.
 */
import { decompress } from '../asset-extraction/compression/lz-decompress';
import type { RomData } from '../asset-extraction/rom/rom-types';

// ─── ROM Addresses ───────────────────────────────────────────────────────────
const ADDR_HI_PTRS = 0x82F94D;
const ADDR_LO_PTRS = 0x82FB2D;
const ADDR_MAP32_0 = 0x838000;
const ADDR_MAP32_1 = 0x83B400;
const ADDR_MAP32_2 = 0x848000;
const ADDR_MAP32_3 = 0x84B400;
const ADDR_MAP16_TO_MAP8 = 0x8F8000;
const ADDR_MAP8_TO_ATTR = 0x8E9459;
const ADDR_OW_ENTRANCE_AREA = 0x9BB96F;
const ADDR_OW_ENTRANCE_POS = 0x9BBA71;
const ADDR_OW_ENTRANCE_ID = 0x9BBB73;
const ADDR_ENTRANCE_ROOM = 0x82C813;

// ─── Types ───────────────────────────────────────────────────────────────────

export type TilePassability =
  | { type: 'free' }
  | { type: 'obstacle'; req: string }
  | { type: 'blocked' }
  | { type: 'ledge'; dir: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' }
  | { type: 'pit' }
  | { type: 'water' };

export interface TransitionPoint {
  row: number;
  col: number;
  edge: 'north' | 'south' | 'east' | 'west' | 'entrance';
  requirements: string[];
  entranceIdx?: number;
}

export interface OverworldEntrance {
  area: number;
  pos: number;
  id: number;
  gridRow: number;
  gridCol: number;
  roomId: number;
}

export interface LedgeTraversal {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface FloodFillResult {
  screenIndex: number;
  reachable: boolean[][];
  transitions: TransitionPoint[];
  reachableCount: number;
  totalTiles: number;
  entrances: OverworldEntrance[];
  /** Tiles entered by jumping a ledge (one-way) */
  ledges: LedgeTraversal[];
  /** Raw collision attribute grid (64x64) for debug inspection */
  attrGrid?: number[][];
  /** Requirements per reachable tile (empty string = free, non-empty = items needed) */
  reqGrid?: string[][];
  /** Per-border summary */
  borders: {
    north: BorderSummary;
    south: BorderSummary;
    east: BorderSummary;
    west: BorderSummary;
  };
}

export interface BorderSummary {
  freeTiles: number[];
  itemTiles: { pos: number; requirements: string[] }[];
}

export interface ConnectionInfo {
  edge: 'north' | 'south' | 'east' | 'west';
  targetScreen: number;
  freeTileCount: number;
  itemTileCount: number;
  positions: number[];
  requirements: string[];
}

// ─── Tile Classification ─────────────────────────────────────────────────────

function classifyTileAttr(attr: number): TilePassability {
  switch (attr) {
    case 0x00: case 0x05: case 0x06: case 0x07:
    case 0x09: case 0x0a: case 0x0c:
    case 0x14: case 0x15: case 0x16: case 0x17:
    case 0x21: case 0x22: case 0x23: case 0x24: case 0x25:
    case 0x30: case 0x31: case 0x32: case 0x33: case 0x34: case 0x35: case 0x36: case 0x37:
    case 0x38: case 0x39: case 0x3a: case 0x3b: case 0x3c:
    case 0x41: case 0x45: case 0x47: case 0x49:
    case 0x5e: case 0x5f: case 0x60: case 0x61: case 0x62: case 0x64: case 0x65: case 0x66:
    case 0xa6: case 0xa7: case 0xbe: case 0xbf:
      return { type: 'free' };
    default:
      if (attr >= 0xd0 && attr <= 0xef) return { type: 'free' };
      break;
  }

  switch (attr) {
    case 0x04:
      return { type: 'free' };
    case 0x40:
      return { type: 'obstacle', req: 'lift.0' };
    case 0x48: case 0x4a:
      return { type: 'obstacle', req: 'lift.0' };
    case 0x4b:
      return { type: 'free' };
    case 0x44:
      return { type: 'free' };
    case 0x08: case 0x0b:
      return { type: 'water' };
    case 0x11: case 0x13:
    case 0x19: case 0x1b:
      return { type: 'free' };
    // Cliff tiles — blocked for BFS (one-way jump handled by cliff-jump preprocessing):
    // 0x10, 0x18: cliff border (top/bottom edge of cliff face)
    // 0x12, 0x1a: cliff side (vertical face of cliff wall)
    case 0x10: case 0x18:
    case 0x12: case 0x1a:
      return { type: 'blocked' };
    case 0x20:
      return { type: 'pit' };
    case 0x27:
      return { type: 'blocked' };
    // 0x28-0x2b: cliff triggers — initially blocked, converted to directional ledges
    // by cliff-jump preprocessing when 2-tile width is satisfied
    case 0x28: case 0x29: case 0x2a: case 0x2b:
      return { type: 'blocked' };
    // Diagonal cliff tiles — treat as blocked walls for BFS purposes.
    // At 8x8 granularity, gaps in the diagonal let BFS leak through if treated as one-way ledges.
    case 0x2c: case 0x2d: case 0x2e: case 0x2f:
      return { type: 'blocked' };
    case 0x01: case 0x02: case 0x03:
    case 0x26: case 0x43: case 0x46:
      return { type: 'blocked' };
    case 0x50: case 0x51:
      return { type: 'obstacle', req: 'lift.0' };
    case 0x52: case 0x53: case 0x54: case 0x55: case 0x56:
      return { type: 'obstacle', req: 'lift.1' };
    case 0x57:
      return { type: 'obstacle', req: 'boots' };
    case 0x6c: case 0x6d: case 0x6e: case 0x6f:
      return { type: 'free' };
    default:
      return { type: 'blocked' };
  }
}

// ─── Map Data ────────────────────────────────────────────────────────────────

interface Map32Tables {
  t0: Buffer; t1: Buffer; t2: Buffer; t3: Buffer;
}

function loadMap32Tables(rom: RomData): Map32Tables {
  const size = 2218 * 6;
  return {
    t0: rom.getBytes(ADDR_MAP32_0, size),
    t1: rom.getBytes(ADDR_MAP32_1, size),
    t2: rom.getBytes(ADDR_MAP32_2, size),
    t3: rom.getBytes(ADDR_MAP32_3, size),
  };
}

function loadMap16ToMap8(rom: RomData): Uint16Array {
  return Uint16Array.from(rom.getWords(ADDR_MAP16_TO_MAP8, 3752 * 4));
}

function loadMap8ToAttr(rom: RomData): Uint8Array {
  return Uint8Array.from(rom.getBytes(ADDR_MAP8_TO_ATTR, 512));
}

function decodeMap32(map32Id: number, tables: Map32Tables): [number, number, number, number] {
  const input = map32Id * 2;
  const a = input & ~7;
  const x = (a >> 1) + (a >> 2);
  const sel = input & 7;

  function readMap16(table: Buffer): number {
    const mainByte = table[x + (sel >> 1)];
    const nibbleByte = table[x + 4 + (sel >> 2)];
    const nibble = (sel & 2) ? (nibbleByte & 0x0f) : (nibbleByte >> 4);
    return mainByte | (nibble << 8);
  }

  return [readMap16(tables.t0), readMap16(tables.t1), readMap16(tables.t2), readMap16(tables.t3)];
}

function decompressScreen(rom: RomData, screenIdx: number, tables: Map32Tables): Uint16Array {
  const hiAddr = rom.get24(ADDR_HI_PTRS + screenIdx * 3);
  const loAddr = rom.get24(ADDR_LO_PTRS + screenIdx * 3);
  const hiBuf = decompress(hiAddr, (a) => rom.getByte(a));
  const loBuf = decompress(loAddr, (a) => rom.getByte(a));

  const map32Ids = new Uint16Array(256);
  for (let i = 0; i < 256; i++) {
    map32Ids[i] = loBuf[i] | (hiBuf[i] << 8);
  }

  const map16 = new Uint16Array(32 * 32);
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const [tl, tr, bl, br] = decodeMap32(map32Ids[row * 16 + col], tables);
      map16[(row * 2) * 32 + col * 2] = tl;
      map16[(row * 2) * 32 + col * 2 + 1] = tr;
      map16[(row * 2 + 1) * 32 + col * 2] = bl;
      map16[(row * 2 + 1) * 32 + col * 2 + 1] = br;
    }
  }
  return map16;
}

function buildCollisionGrid(
  map16: Uint16Array,
  map16ToMap8: Uint16Array,
  map8ToAttr: Uint8Array,
): { grid: TilePassability[][]; rawAttr: number[][] } {
  const grid: TilePassability[][] = [];
  const rawAttr: number[][] = [];
  for (let row = 0; row < 64; row++) {
    grid[row] = [];
    rawAttr[row] = [];
    for (let col = 0; col < 64; col++) {
      const map16Row = row >> 1;
      const map16Col = col >> 1;
      const subIdx = (row & 1) * 2 + (col & 1);
      const map16Id = map16[map16Row * 32 + map16Col];
      const map8Entry = map16ToMap8[map16Id * 4 + subIdx];
      const attr = map8ToAttr[map8Entry & 0x1ff];
      rawAttr[row][col] = attr;
      grid[row][col] = classifyTileAttr(attr);
    }
  }
  return { grid, rawAttr };
}

// ─── Flood Fill ──────────────────────────────────────────────────────────────

interface FloodCell {
  row: number;
  col: number;
  requirements: Set<string>;
}

function floodFill(
  grid: TilePassability[][],
  startRow: number,
  startCol: number,
  entrancePositions: { row: number; col: number; idx: number }[],
  inventory: Set<string>,
): { reachable: boolean[][]; transitions: TransitionPoint[]; reachableCount: number; reqGrid: string[][] } {
  const rows = 64, cols = 64;
  const reached: (Set<string> | null)[][] = Array.from({ length: rows }, () => new Array(cols).fill(null));
  const transitions: TransitionPoint[] = [];
  const foundBorders = new Set<string>();

  const deque: FloodCell[] = [];
  const startReqs = new Set<string>();
  deque.push({ row: startRow, col: startCol, requirements: startReqs });
  reached[startRow][startCol] = startReqs;

  const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (deque.length > 0) {
    const cell = deque.shift()!;
    const { row, col, requirements } = cell;

    const existing = reached[row][col]!;
    if (existing.size < requirements.size) continue;

    if (row === 0) {
      const key = `north-${col}`;
      if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'north', requirements: [...requirements] }); }
    }
    if (row === 63) {
      const key = `south-${col}`;
      if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'south', requirements: [...requirements] }); }
    }
    if (col === 0) {
      const key = `west-${row}`;
      if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'west', requirements: [...requirements] }); }
    }
    if (col === 63) {
      const key = `east-${row}`;
      if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row, col, edge: 'east', requirements: [...requirements] }); }
    }

    for (const ent of entrancePositions) {
      if (Math.abs(row - ent.row) <= 6 && Math.abs(col - ent.col) <= 6) {
        const key = `entrance-${ent.idx}`;
        if (!foundBorders.has(key)) { foundBorders.add(key); transitions.push({ row: ent.row, col: ent.col, edge: 'entrance', requirements: [...requirements], entranceIdx: ent.idx }); }
      }
    }

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

      // If current tile is a ledge, only allow leaving in the ledge direction.
      // This prevents the BFS from moving sideways off a cliff edge.
      const currentTile = grid[row][col];
      if (currentTile.type === 'ledge') {
        const canLeave =
          (currentTile.dir === 's' && dr === 1) ||
          (currentTile.dir === 'n' && dr === -1) ||
          (currentTile.dir === 'e' && dc === 1) ||
          (currentTile.dir === 'w' && dc === -1);
        if (!canLeave) continue;
      }

      const tile = grid[nr][nc];
      let canEnter = false;
      let newReqs = requirements;

      switch (tile.type) {
        case 'free':
          canEnter = true;
          break;
        case 'obstacle':
          if (inventory.has(tile.req)) {
            canEnter = true;
            if (!requirements.has(tile.req)) { newReqs = new Set(requirements); newReqs.add(tile.req); }
          }
          break;
        case 'water':
          if (inventory.has('flippers')) {
            canEnter = true;
            if (!requirements.has('flippers')) { newReqs = new Set(requirements); newReqs.add('flippers'); }
          }
          break;
        case 'ledge':
          if (tile.dir === 's' && dr === 1) canEnter = true;
          else if (tile.dir === 'n' && dr === -1) canEnter = true;
          else if (tile.dir === 'e' && dc === 1) canEnter = true;
          else if (tile.dir === 'w' && dc === -1) canEnter = true;
          else if (tile.dir === 'ne' && (dr === -1 || dc === 1)) canEnter = true;
          else if (tile.dir === 'nw' && (dr === -1 || dc === -1)) canEnter = true;
          else if (tile.dir === 'se' && (dr === 1 || dc === 1)) canEnter = true;
          else if (tile.dir === 'sw' && (dr === 1 || dc === -1)) canEnter = true;
          break;
        case 'pit':
          canEnter = true;
          break;
        case 'blocked':
          break;
      }

      if (!canEnter) continue;

      // Link needs ~2 sub-tiles (16px) of width to pass through.
      // Reject tiles that form 1-tile-wide corridors perpendicular to movement.
      // Skip this check for ledge tiles — cliff edges span full width and Link jumps them fine.
      if (tile.type !== 'ledge') {
        const isPassable = (t: TilePassability) => {
          if (t.type === 'free' || t.type === 'pit') return true;
          if (t.type === 'obstacle') return inventory.has(t.req);
          if (t.type === 'water') return inventory.has('flippers');
          return false;
        };
        let hasClearance = false;
        if (dr !== 0) {
          // Moving vertically — check horizontal clearance
          if (nc > 0 && isPassable(grid[nr][nc - 1])) hasClearance = true;
          else if (nc < cols - 1 && isPassable(grid[nr][nc + 1])) hasClearance = true;
        } else {
          // Moving horizontally — check vertical clearance
          if (nr > 0 && isPassable(grid[nr - 1][nc])) hasClearance = true;
          else if (nr < rows - 1 && isPassable(grid[nr + 1][nc])) hasClearance = true;
        }
        if (!hasClearance) continue;
      }

      const existingReqs = reached[nr][nc];
      if (existingReqs !== null && existingReqs.size <= newReqs.size) continue;

      reached[nr][nc] = newReqs;
      if (newReqs === requirements) {
        deque.unshift({ row: nr, col: nc, requirements: newReqs });
      } else {
        deque.push({ row: nr, col: nc, requirements: newReqs });
      }
    }
  }

  let reachableCount = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (reached[r][c] !== null) reachableCount++;

  const reachable: boolean[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => reached[r][c] !== null)
  );

  // Build requirements grid: comma-joined requirement strings per tile
  const reqGrid: string[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const reqs = reached[r][c];
      return reqs && reqs.size > 0 ? [...reqs].join(',') : '';
    })
  );

  return { reachable, transitions, reachableCount, reqGrid };
}

// ─── Entrance Lookup ─────────────────────────────────────────────────────────

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

// ─── Public API ──────────────────────────────────────────────────────────────

/** Cached tables to avoid reloading on every screen change */
let cachedTables: { map32: Map32Tables; map16ToMap8: Uint16Array; map8ToAttr: Uint8Array; entrances: OverworldEntrance[] } | null = null;

export function initFloodFillEngine(rom: RomData): void {
  cachedTables = {
    map32: loadMap32Tables(rom),
    map16ToMap8: loadMap16ToMap8(rom),
    map8ToAttr: loadMap8ToAttr(rom),
    entrances: loadOverworldEntrances(rom),
  };
}

export function getAdjacentScreen(screenIdx: number, edge: 'north' | 'south' | 'east' | 'west'): number | null {
  const col = screenIdx & 7;
  const row = (screenIdx >> 3) & 7;
  const world = screenIdx & 0x40; // 0 = LW, 0x40 = DW

  switch (edge) {
    case 'north': return row > 0 ? world | ((row - 1) << 3) | col : null;
    case 'south': return row < 7 ? world | ((row + 1) << 3) | col : null;
    case 'west': return col > 0 ? world | (row << 3) | (col - 1) : null;
    case 'east': return col < 7 ? world | (row << 3) | (col + 1) : null;
  }
}

export function runFloodFill(rom: RomData, screenIndex: number, inventory?: Set<string>): FloodFillResult {
  if (!cachedTables) initFloodFillEngine(rom);
  const { map32, map16ToMap8, map8ToAttr, entrances } = cachedTables!;

  // Decompress the screen's tile data
  const map16 = decompressScreen(rom, screenIndex, map32);
  const { grid, rawAttr } = buildCollisionGrid(map16, map16ToMap8, map8ToAttr);

  // Cliff-jump preprocessing: cliff triggers indicate one-way jumps.
  // Link jumps in the trigger's direction through consecutive wall tiles until landing.
  // Needs 2 tiles of perpendicular width to fit.
  // Directions confirmed by tile recorder:
  //   0x28=north, 0x29=south, 0x2a=west, 0x2b=east, 0x2f=east
  const CLIFF_TRIGGERS = new Set([0x28, 0x29, 0x2a, 0x2b, 0x2f]);
  const CLIFF_DIRS: Record<number, { dr: number; dc: number; dir: 'n' | 's' | 'e' | 'w' }> = {
    0x28: { dr: -1, dc: 0, dir: 'n' },
    0x29: { dr: 1, dc: 0, dir: 's' },
    0x2a: { dr: 0, dc: -1, dir: 'w' },
    0x2b: { dr: 0, dc: 1, dir: 'e' },
    0x2f: { dr: 0, dc: 1, dir: 'e' },
  };
  // Wall tiles that form cliff faces (Link jumps through these)
  const CLIFF_WALL = new Set([0x01, 0x02, 0x03, 0x1a, 0x12]);
  const ledges: LedgeTraversal[] = [];

  for (let row = 0; row < 64; row++) {
    for (let col = 0; col < 64; col++) {
      const attr = rawAttr[row][col];
      if (!CLIFF_TRIGGERS.has(attr)) continue;

      const { dr, dc, dir } = CLIFF_DIRS[attr];

      // Check 2-tile perpendicular width
      let has2Wide = false;
      if (dr !== 0) {
        if (col > 0 && (CLIFF_TRIGGERS.has(rawAttr[row][col - 1]) || CLIFF_WALL.has(rawAttr[row][col - 1]))) has2Wide = true;
        if (col < 63 && (CLIFF_TRIGGERS.has(rawAttr[row][col + 1]) || CLIFF_WALL.has(rawAttr[row][col + 1]))) has2Wide = true;
      } else {
        if (row > 0 && (CLIFF_TRIGGERS.has(rawAttr[row - 1][col]) || CLIFF_WALL.has(rawAttr[row - 1][col]))) has2Wide = true;
        if (row < 63 && (CLIFF_TRIGGERS.has(rawAttr[row + 1][col]) || CLIFF_WALL.has(rawAttr[row + 1][col]))) has2Wide = true;
      }
      if (!has2Wide) continue;

      // Convert trigger tile and consecutive wall tiles in jump direction to ledges
      grid[row][col] = { type: 'ledge', dir };
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < 64 && c >= 0 && c < 64 && CLIFF_WALL.has(rawAttr[r][c])) {
        grid[r][c] = { type: 'ledge', dir };
        r += dr;
        c += dc;
      }
      // Record the complete jump: from trigger to landing position
      ledges.push({ startRow: row, startCol: col, endRow: r, endCol: c });
    }
  }

  // Diagonal cliff-jump preprocessing.
  // Diagonal cliffs zigzag through tiles alternating between two component directions.
  // 0x2c = NW diagonal, 0x2e = NE diagonal (confirmed by tile recorder).
  // Tiles in the path: 0x2c, 0x2d, 0x2e, 0x1a, 0x12.
  const DIAG_CLIFF_TILES = new Set([0x2c, 0x2d, 0x2e, 0x1a, 0x12]);
  const DIAG_TRIGGERS: Record<number, { dir: 'ne' | 'nw' | 'se' | 'sw'; d1: [number, number]; d2: [number, number] }> = {
    0x2c: { dir: 'nw', d1: [-1, 0], d2: [0, -1] }, // north + west
    0x2d: { dir: 'se', d1: [1, 0], d2: [0, 1] },   // south + east
    0x2e: { dir: 'ne', d1: [-1, 0], d2: [0, 1] },  // north + east
  };

  // Process in priority order: 0x2c first (NW), then 0x2d (SE), then 0x2e (NE).
  // This prevents 0x2e tiles inside a NW path from being claimed as NE triggers.
  const diagTriggerOrder = [0x2c, 0x2d, 0x2e];

  for (const triggerAttr of diagTriggerOrder) {
    const { dir, d1, d2 } = DIAG_TRIGGERS[triggerAttr];
    for (let row = 0; row < 64; row++) {
      for (let col = 0; col < 64; col++) {
        if (rawAttr[row][col] !== triggerAttr) continue;
        if (grid[row][col].type === 'ledge') continue; // already processed

        // Approach check: trigger must have a free tile on the entry side
        // (opposite of both component directions). For NW: entry from south or east.
        const approachR1 = row - d1[0], approachC1 = col - d1[1]; // opposite of d1
        const approachR2 = row - d2[0], approachC2 = col - d2[1]; // opposite of d2
        const hasApproach =
          (approachR1 >= 0 && approachR1 < 64 && approachC1 >= 0 && approachC1 < 64 && grid[approachR1][approachC1].type === 'free') ||
          (approachR2 >= 0 && approachR2 < 64 && approachC2 >= 0 && approachC2 < 64 && grid[approachR2][approachC2].type === 'free');
        if (!hasApproach) continue;

        // Follow zigzag path: at each step try both component directions
        const path: [number, number][] = [[row, col]];
        let r = row, c = col;
        for (let steps = 0; steps < 12; steps++) {
          // Try d1 first, then d2
          let nr = r + d1[0], nc = c + d1[1];
          if (nr >= 0 && nr < 64 && nc >= 0 && nc < 64 && DIAG_CLIFF_TILES.has(rawAttr[nr][nc]) && grid[nr][nc].type !== 'ledge') {
            path.push([nr, nc]);
            r = nr; c = nc;
            continue;
          }
          // Try d2
          nr = r + d2[0]; nc = c + d2[1];
          if (nr >= 0 && nr < 64 && nc >= 0 && nc < 64 && DIAG_CLIFF_TILES.has(rawAttr[nr][nc]) && grid[nr][nc].type !== 'ledge') {
            path.push([nr, nc]);
            r = nr; c = nc;
            continue;
          }
          break; // no valid continuation
        }

        if (path.length < 2) continue; // need at least trigger + 1 face tile

        // Must actually be diagonal: path must span both rows AND columns
        const minR = Math.min(...path.map(p => p[0])), maxR = Math.max(...path.map(p => p[0]));
        const minC = Math.min(...path.map(p => p[1])), maxC = Math.max(...path.map(p => p[1]));
        if (minR === maxR || minC === maxC) continue; // purely horizontal or vertical — not diagonal

        // Mark all tiles in path as diagonal ledges
        for (const [pr, pc] of path) {
          grid[pr][pc] = { type: 'ledge', dir };
        }

        // Landing: try d2 first (lateral), then d1 (vertical) from last tile
        let endR = r + d2[0], endC = c + d2[1];
        if (!(endR >= 0 && endR < 64 && endC >= 0 && endC < 64 && grid[endR][endC].type === 'free')) {
          endR = r + d1[0]; endC = c + d1[1];
        }
        if (!(endR >= 0 && endR < 64 && endC >= 0 && endC < 64)) {
          endR = r; endC = c; // fallback
        }

        ledges.push({ startRow: row, startCol: col, endRow: endR, endCol: endC });
      }
    }
  }

  // South-cliff scan from diagonal edge tiles and cliff borders.
  // Detects southward cliff jumps by finding edge tiles with cliff face below.
  const DIAG_EDGE_ATTRS = new Set([0x2c, 0x2d, 0x2e, 0x2f, 0x1a]);
  // Cliff border tiles (0x10, 0x18) can also be the top of a south-facing cliff
  // when there's a free tile directly above them.
  const CLIFF_BORDER_ATTRS = new Set([0x10, 0x18]);

  const isSouthCliffTile = (r: number, c: number) =>
    grid[r][c].type === 'blocked' || (grid[r][c].type === 'ledge' && (grid[r][c] as { dir: string }).dir === 's');

  for (let row = 0; row < 63; row++) {
    for (let col = 0; col < 64; col++) {
      const attr = rawAttr[row][col];
      const isDiagEdge = DIAG_EDGE_ATTRS.has(attr);
      const isCliffBorder = CLIFF_BORDER_ATTRS.has(attr) && row > 0 &&
        (grid[row - 1][col].type === 'free' || grid[row - 1][col].type === 'ledge');

      if (!isDiagEdge && !isCliffBorder) continue;
      // Must have cliff face directly south (blocked or already ledge-S from straight scan)
      if (!isSouthCliffTile(row + 1, col)) continue;
      // If edge tile is still blocked (not claimed by diagonal/straight scan), convert to free
      if (grid[row][col].type === 'blocked') {
        grid[row][col] = { type: 'free' };
      }

      // Scan south through cliff face tiles
      let r = row + 1;
      while (r < 64 && isSouthCliffTile(r, col)) {
        if (grid[r][col].type === 'blocked') {
          grid[r][col] = { type: 'ledge', dir: 's' };
        }
        r++;
      }
      if (r > row + 1 && r < 64) {
        ledges.push({ startRow: row, startCol: col, endRow: r, endCol: col });
      }
    }
  }

  // Find entrances on this screen
  const screenEntrances = entrances.filter(e => (e.area & 0x3f) === (screenIndex & 0x3f));

  // Build entrance positions for the flood fill
  const entrancePositions = screenEntrances.map(e => ({ row: e.gridRow, col: e.gridCol, idx: e.id }));

  // Find a good starting position (first free tile near center, or first free tile overall)
  let startRow = 32, startCol = 32;
  if (grid[startRow][startCol].type !== 'free') {
    let found = false;
    for (let radius = 1; radius < 32 && !found; radius++) {
      for (let dr = -radius; dr <= radius && !found; dr++) {
        for (let dc = -radius; dc <= radius && !found; dc++) {
          const r = 32 + dr, c = 32 + dc;
          if (r >= 0 && r < 64 && c >= 0 && c < 64 && grid[r][c].type === 'free') {
            startRow = r; startCol = c; found = true;
          }
        }
      }
    }
  }

  const { reachable, transitions, reachableCount, reqGrid } = floodFill(grid, startRow, startCol, entrancePositions, inventory ?? new Set());

  // Filter ledges to only include ones BFS actually reached (start tile must be reachable)
  const reachableLedges = ledges.filter(l => reachable[l.startRow]?.[l.startCol]);

  // Summarize borders
  const borders: FloodFillResult['borders'] = { north: { freeTiles: [], itemTiles: [] }, south: { freeTiles: [], itemTiles: [] }, east: { freeTiles: [], itemTiles: [] }, west: { freeTiles: [], itemTiles: [] } };
  for (const t of transitions) {
    if (t.edge === 'entrance') continue;
    const pos = t.edge === 'north' || t.edge === 'south' ? t.col : t.row;
    if (t.requirements.length === 0) {
      borders[t.edge].freeTiles.push(pos);
    } else {
      borders[t.edge].itemTiles.push({ pos, requirements: t.requirements });
    }
  }

  // Build connection info
  return {
    screenIndex,
    reachable,
    transitions,
    reachableCount,
    totalTiles: 64 * 64,
    entrances: screenEntrances,
    ledges: reachableLedges,
    attrGrid: rawAttr,
    reqGrid,
    borders,
  };
}

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

/** Screen name lookup */
export const SCREEN_NAMES: Record<number, string> = {
  0x00: 'Lost Woods NW', 0x01: 'Lost Woods NE', 0x02: 'Lumberjack Area',
  0x03: 'Death Mountain West', 0x05: 'Death Mountain East', 0x07: 'Turtle Rock Area',
  0x0A: 'Witch Hut', 0x0F: 'Master Sword Grove',
  0x10: 'Kakariko NW', 0x11: 'Kakariko NE', 0x12: 'Graveyard West',
  0x14: 'Graveyard East', 0x18: 'Kakariko SW', 0x19: 'Kakariko SE',
  0x1A: 'Haunted Grove', 0x1B: 'Castle Entrance',
  0x22: 'Hyrule Castle', 0x28: 'Desert NW', 0x29: 'Eastern Palace',
  0x2A: 'Desert North', 0x2B: "Uncle's Estate West", 0x2C: "Uncle's Estate East",
  0x2D: 'Hylia Shore NW', 0x2E: 'Eastern Peninsula',
  0x30: 'Desert SW', 0x32: 'Desert East', 0x33: 'Dam Headwaters',
  0x34: 'Hyrule Wetlands NE', 0x35: 'Lake Hylia NW',
  0x3A: 'South Shore', 0x3B: 'Lake Hylia Island',
};
