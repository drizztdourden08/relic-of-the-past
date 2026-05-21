/**
 * Flood-fill overworld connectivity extractor.
 *
 * Instead of checking borders in isolation, this does actual BFS pathfinding
 * from known positions to discover which transitions are reachable.
 *
 * Approach:
 * 1. Start from a known position (e.g. Link's House exit on lw-2c)
 * 2. Flood-fill all walkable tiles (treating removable obstacles as passable)
 * 3. Record all reachable screen borders and entrance positions
 * 4. Cross transitions and repeat on adjacent screens
 *
 * Usage: npx tsx scripts/flood-fill-connectivity.ts
 */
import { loadRom } from '../shared/asset-extraction/rom/rom-loader';
import { decompress } from '../shared/asset-extraction/compression/lz-decompress';
import type { RomData } from '../shared/asset-extraction/rom/rom-types';

// ─── ROM Addresses ───────────────────────────────────────────────────────────
const ADDR_AREA_HEADS = 0x82A5EC;
const ADDR_IS_SMALL = 0x82F88D;
const ADDR_HI_PTRS = 0x82F94D;
const ADDR_LO_PTRS = 0x82FB2D;
const ADDR_MAP32_0 = 0x838000;
const ADDR_MAP32_1 = 0x83B400;
const ADDR_MAP32_2 = 0x848000;
const ADDR_MAP32_3 = 0x84B400;
const ADDR_MAP16_TO_MAP8 = 0x8F8000;
const ADDR_MAP8_TO_ATTR = 0x8E9459;

// Overworld entrance table
const ADDR_OW_ENTRANCE_AREA = 0x9BB96F;  // 129 uint16
const ADDR_OW_ENTRANCE_POS = 0x9BBA71;   // 129 uint16
const ADDR_OW_ENTRANCE_ID = 0x9BBB73;    // 129 uint8

// ─── Tile Classification ─────────────────────────────────────────────────────

/** What requirement (if any) is needed to pass through this tile */
type TilePassability =
  | { type: 'free' }           // walkable, no item needed
  | { type: 'obstacle'; req: string }  // passable with item (e.g. 'gloves', 'sword', 'flippers')
  | { type: 'blocked' }       // truly impassable wall/cliff
  | { type: 'ledge'; dir: 'n' | 's' | 'e' | 'w' }  // one-way ledge
  | { type: 'pit' }           // hole/pit (one-way down)
  | { type: 'water' }         // deep water (needs flippers)
  | { type: 'door'; tileType: number }  // door/entrance trigger

function classifyTileAttr(attr: number): TilePassability {
  switch (attr) {
    // Freely walkable (NothingOW + similar)
    case 0x00: case 0x05: case 0x06: case 0x07:
    case 0x09: case 0x0a:  // shallow water, water ladder
    case 0x14: case 0x15: case 0x16: case 0x17:
    case 0x21: case 0x23: case 0x24: case 0x25:
    case 0x38: case 0x39: case 0x3a: case 0x3b: case 0x3c:
    case 0x41: case 0x45: case 0x47: case 0x49:
    case 0x5e: case 0x5f: case 0x61: case 0x62: case 0x64: case 0x65: case 0x66:
    case 0xa6: case 0xa7: case 0xbe: case 0xbf:
      return { type: 'free' };

    // 0xd0-0xef: all walkable outdoors
    default:
      if (attr >= 0xd0 && attr <= 0xef) return { type: 'free' };
      break;
  }

  switch (attr) {
    // Thick grass — walkable (no collision, just visual/cuttable)
    case 0x04: case 0x40:
      return { type: 'free' };

    // Diggable ground — walkable (tiledetect_normal_tiles, no R14 collision)
    case 0x48: case 0x4a:
      return { type: 'free' };

    // Warp tile — walkable (triggers warp effect but no collision)
    case 0x4b:
      return { type: 'free' };

    // Spikes — walkable but damages (doesn't block movement)
    case 0x44:
      return { type: 'free' };

    // Deep water — need flippers
    case 0x08:
      return { type: 'water' };

    // Slopes — walkable (just have directional movement)
    case 0x10: case 0x11: case 0x12: case 0x13:
    case 0x18: case 0x19: case 0x1a: case 0x1b:
      return { type: 'free' };

    // Pit / hole
    case 0x20:
      return { type: 'pit' };

    // Hookshottable (fence posts etc) — blocks walk
    case 0x27:
      return { type: 'blocked' };

    // Ledges — one-way
    case 0x28: return { type: 'ledge', dir: 's' };  // jump south
    case 0x29: return { type: 'ledge', dir: 'n' };  // jump north
    case 0x2a: return { type: 'ledge', dir: 'e' };  // jump east
    case 0x2b: return { type: 'ledge', dir: 'w' };  // jump west
    case 0x2c: case 0x2e: return { type: 'ledge', dir: 's' }; // diagonal south
    case 0x2d: case 0x2f: return { type: 'ledge', dir: 'n' }; // diagonal north

    // Standard collision (walls, cliffs)
    case 0x01: case 0x02: case 0x03:
    case 0x26: case 0x43: case 0x46:
      return { type: 'blocked' };

    // Liftable objects — blocks walk but removable
    case 0x50: case 0x51:
      return { type: 'obstacle', req: 'gloves' };  // light liftable
    case 0x52: case 0x53: case 0x54: case 0x55: case 0x56:
      return { type: 'obstacle', req: 'titan-mitt' };  // heavy liftable

    // Bonk rocks — need pegasus boots
    case 0x57:
      return { type: 'obstacle', req: 'boots' };

    // Outdoor-specific that are walkable
    case 0x6c: case 0x6d: case 0x6e: case 0x6f:
      return { type: 'free' };  // walkable outdoors

    default:
      return { type: 'blocked' };
  }
}

// ─── Map Data Loading ────────────────────────────────────────────────────────

function loadMap32Tables(rom: RomData) {
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

function decodeMap32(
  map32Id: number,
  tables: { t0: Buffer; t1: Buffer; t2: Buffer; t3: Buffer },
): [number, number, number, number] {
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

function decompressScreen(rom: RomData, screenIdx: number, tables: ReturnType<typeof loadMap32Tables>): Uint16Array {
  const hiAddr = rom.get24(ADDR_HI_PTRS + screenIdx * 3);
  const loAddr = rom.get24(ADDR_LO_PTRS + screenIdx * 3);
  // offsetIsBe = true (default) — matches Decompress_bank02's big-endian offset reads
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

// ─── Collision Grid ──────────────────────────────────────────────────────────

/**
 * Build a collision grid from a Map16 tile grid.
 * Resolution: 64×64 (each Map16 tile has 4 sub-tiles = Map8 level, 8×8px each)
 * This gives us the granularity needed for accurate Link movement (he's ~16px wide = 2 sub-tiles)
 */
function buildCollisionGrid(
  map16: Uint16Array,
  map16ToMap8: Uint16Array,
  map8ToAttr: Uint8Array,
): TilePassability[][] {
  const grid: TilePassability[][] = [];
  for (let row = 0; row < 64; row++) {
    grid[row] = [];
    for (let col = 0; col < 64; col++) {
      const map16Row = row >> 1;  // 0-31
      const map16Col = col >> 1;  // 0-31
      const subRow = row & 1;     // 0 or 1 within Map16
      const subCol = col & 1;
      const subIdx = subRow * 2 + subCol; // 0=TL, 1=TR, 2=BL, 3=BR

      const map16Id = map16[map16Row * 32 + map16Col];
      const map8Entry = map16ToMap8[map16Id * 4 + subIdx];
      const attr = map8ToAttr[map8Entry & 0x1ff];
      grid[row][col] = classifyTileAttr(attr);
    }
  }
  return grid;
}

// ─── BFS Flood Fill ──────────────────────────────────────────────────────────

interface FloodCell {
  row: number;
  col: number;
  /** Requirements accumulated to reach this cell */
  requirements: Set<string>;
}

interface TransitionPoint {
  /** Position on this screen's grid (64×64) */
  row: number;
  col: number;
  /** Which edge: n/s/e/w/entrance */
  edge: 'north' | 'south' | 'east' | 'west' | 'entrance';
  /** Item requirements to reach this point */
  requirements: string[];
  /** For entrance type: entrance index */
  entranceIdx?: number;
}

interface FloodResult {
  /** All reachable tiles (64×64 boolean grid) */
  reachable: boolean[][];
  /** Transitions found */
  transitions: TransitionPoint[];
  /** Count of reachable tiles */
  reachableCount: number;
  /** Total tiles */
  totalTiles: number;
}

/**
 * BFS flood-fill from a starting position on the collision grid.
 * Treats obstacles (rocks, bushes) as passable but records their requirements.
 * Records all screen-edge transitions and entrance positions reached.
 */
function floodFill(
  grid: TilePassability[][],
  startRow: number,
  startCol: number,
  entrancePositions: { row: number; col: number; idx: number }[],
): FloodResult {
  const rows = 64, cols = 64;
  // Track minimum requirements to reach each tile (null = not visited)
  const reached: (Set<string> | null)[][] = Array.from({ length: rows }, () => new Array(cols).fill(null));

  const transitions: TransitionPoint[] = [];
  const foundBorders = new Set<string>(); // dedup

  // 0-1 BFS: free tiles go to front (cost 0), obstacle tiles go to back (cost 1)
  // This ensures we find minimum-requirement paths
  const deque: FloodCell[] = [];
  const startReqs = new Set<string>();
  deque.push({ row: startRow, col: startCol, requirements: startReqs });
  reached[startRow][startCol] = startReqs;

  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // N, S, W, E

  while (deque.length > 0) {
    const cell = deque.shift()!;
    const { row, col, requirements } = cell;

    // Skip if we've already found a BETTER (fewer reqs) path to this tile
    const existing = reached[row][col]!;
    if (existing.size < requirements.size) continue;

    // Check if this is a border tile
    if (row === 0) {
      const key = `north-${col}`;
      if (!foundBorders.has(key)) {
        foundBorders.add(key);
        transitions.push({ row, col, edge: 'north', requirements: [...requirements] });
      }
    }
    if (row === 63) {
      const key = `south-${col}`;
      if (!foundBorders.has(key)) {
        foundBorders.add(key);
        transitions.push({ row, col, edge: 'south', requirements: [...requirements] });
      }
    }
    if (col === 0) {
      const key = `west-${row}`;
      if (!foundBorders.has(key)) {
        foundBorders.add(key);
        transitions.push({ row, col, edge: 'west', requirements: [...requirements] });
      }
    }
    if (col === 63) {
      const key = `east-${row}`;
      if (!foundBorders.has(key)) {
        foundBorders.add(key);
        transitions.push({ row, col, edge: 'east', requirements: [...requirements] });
      }
    }

    // Check if this is an entrance position (within 4 sub-tiles = 32px)
    for (const ent of entrancePositions) {
      if (Math.abs(row - ent.row) <= 4 && Math.abs(col - ent.col) <= 4) {
        const key = `entrance-${ent.idx}`;
        if (!foundBorders.has(key)) {
          foundBorders.add(key);
          transitions.push({ row: ent.row, col: ent.col, edge: 'entrance', requirements: [...requirements], entranceIdx: ent.idx });
        }
      }
    }

    // Expand neighbors
    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

      const tile = grid[nr][nc];
      let canEnter = false;
      let newReqs = requirements; // Keep same set reference for free tiles

      switch (tile.type) {
        case 'free':
          canEnter = true;
          break;
        case 'obstacle':
          canEnter = true;
          if (!requirements.has(tile.req)) {
            newReqs = new Set(requirements);
            newReqs.add(tile.req);
          }
          break;
        case 'water':
          canEnter = true;
          if (!requirements.has('flippers')) {
            newReqs = new Set(requirements);
            newReqs.add('flippers');
          }
          break;
        case 'ledge':
          // Can only jump in the ledge's direction
          if (tile.dir === 's' && dr === 1) canEnter = true;
          else if (tile.dir === 'n' && dr === -1) canEnter = true;
          else if (tile.dir === 'e' && dc === 1) canEnter = true;
          else if (tile.dir === 'w' && dc === -1) canEnter = true;
          break;
        case 'pit':
          canEnter = true;
          break;
        case 'blocked':
          canEnter = false;
          break;
      }

      if (!canEnter) continue;

      // Check if this path is better than existing
      const existingReqs = reached[nr][nc];
      if (existingReqs !== null && existingReqs.size <= newReqs.size) continue;

      reached[nr][nc] = newReqs;

      // 0-1 BFS: free tiles (no new requirement) go to FRONT, obstacles go to BACK
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

  // Build visited array for display
  const visited: boolean[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => reached[r][c] !== null)
  );

  return { reachable: visited, transitions, reachableCount, totalTiles: rows * cols };
}

// ─── Overworld Entrance Lookup ───────────────────────────────────────────────

interface OverworldEntrance {
  area: number;  // overworld screen ID
  pos: number;   // encoded position
  id: number;    // entrance ID (→ dungeon)
  // Decoded position on screen (in Map8/sub-tile coordinates, 64×64 grid)
  gridRow: number;
  gridCol: number;
}

function loadOverworldEntrances(rom: RomData): OverworldEntrance[] {
  const entrances: OverworldEntrance[] = [];
  for (let i = 0; i < 129; i++) {
    const area = rom.getWord(ADDR_OW_ENTRANCE_AREA + i * 2);
    const pos = rom.getWord(ADDR_OW_ENTRANCE_POS + i * 2);
    const id = rom.getByte(ADDR_OW_ENTRANCE_ID + i);

    // Decode position: pos = map16_row * 128 + map16_col * 2
    // From Overworld_UseEntrance():
    //   pos = ((yc - base_y) & mask_y) * 8 + ((xc - base_x) & mask_x)
    //   where mask_y = 0x1F0 (small) → aligns to 16px = map16 row
    //   and mask_x = 0x3E (small) → aligns to map16 col * 2
    // So: pos = map16_row * 128 + map16_col * 2
    const map16Row = pos >> 7;           // 0-31
    const map16Col = (pos & 0x7F) >> 1;  // 0-63 (but 0-31 for small screens)

    // Convert to 64×64 sub-tile grid (×2 since Map16 has 2×2 Map8 sub-tiles)
    const gridRow = (map16Row % 32) * 2;
    const gridCol = (map16Col % 32) * 2;

    entrances.push({ area, pos, id, gridRow, gridCol });
  }
  return entrances;
}

// ─── Entrance Data (which room each entrance leads to) ─────────────────────

function getEntranceRoomId(rom: RomData, entranceId: number): number {
  return rom.getWord(0x82C813 + entranceId * 2);
}

// ─── Main ────────────────────────────────────────────────────────────────────

const SCREEN_NAMES: Record<number, string> = {
  0x2B: "Uncle's Estate West", 0x2C: "Uncle's Estate East",
  0x34: 'Hyrule Wetlands NE', 0x33: 'Dam Headwaters',
  0x24: 'Hyrule Castle SE', 0x25: 'Castle South Bridge',
  0x2D: 'Hylia Shore NW', 0x2E: 'Eastern Peninsula',
};

function run() {
  const romPath = 'test-roms/Legend of Zelda, The - A Link to the Past (USA).sfc';
  console.log('Loading ROM...');
  const rom = loadRom(romPath);

  console.log('Loading tables...');
  const map32Tables = loadMap32Tables(rom);
  const map16ToMap8 = loadMap16ToMap8(rom);
  const map8ToAttr = loadMap8ToAttr(rom);

  // Target: screen lw-2c (Uncle's Estate East) where Link's House is
  const targetScreen = 0x2C;
  console.log(`\nDecompressing screen 0x${targetScreen.toString(16).toUpperCase()} (${SCREEN_NAMES[targetScreen]})...`);
  const map16 = decompressScreen(rom, targetScreen, map32Tables);

  console.log('Building collision grid (64×64 sub-tile resolution)...');
  const grid = buildCollisionGrid(map16, map16ToMap8, map8ToAttr);

  // Debug: show distribution of tile types across the whole screen
  const typeCounts: Record<string, number> = {};
  const attrCounts: Record<number, number> = {};
  for (let r = 0; r < 64; r++) {
    for (let c = 0; c < 64; c++) {
      const t = grid[r][c];
      const key = t.type === 'obstacle' ? `obstacle:${t.req}` : t.type;
      typeCounts[key] = (typeCounts[key] || 0) + 1;

      // Also get raw attr
      const map16Row = r >> 1;
      const map16Col = c >> 1;
      const subIdx = (r & 1) * 2 + (c & 1);
      const map16Id = map16[map16Row * 32 + map16Col];
      const map8Entry = map16ToMap8[map16Id * 4 + subIdx];
      const attr = map8ToAttr[map8Entry & 0x1ff];
      attrCounts[attr] = (attrCounts[attr] || 0) + 1;
    }
  }
  console.log('\nTile type distribution:');
  for (const [k, v] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v} (${(v / 4096 * 100).toFixed(1)}%)`);
  }
  console.log('\nTop raw attribute values:');
  const sortedAttrs = Object.entries(attrCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
  for (const [attr, count] of sortedAttrs) {
    console.log(`  0x${Number(attr).toString(16).padStart(2, '0')}: ${count} tiles`);
  }

  // Find all overworld entrances on this screen
  const allEntrances = loadOverworldEntrances(rom);
  const screenEntrances = allEntrances.filter(e => (e.area & 0x3f) === targetScreen);
  console.log(`\nEntrances on screen 0x${targetScreen.toString(16)}:`);
  for (const ent of screenEntrances) {
    const roomId = getEntranceRoomId(rom, ent.id);
    console.log(`  Entrance ${ent.id} → Room ${roomId} (0x${roomId.toString(16)}) at grid pos (${ent.gridRow}, ${ent.gridCol})`);
  }

  // Find Link's House entrance (room 0x104 = 260)
  const linksHouseEntrance = screenEntrances.find(e => getEntranceRoomId(rom, e.id) === 260);
  if (!linksHouseEntrance) {
    console.error('Could not find Link\'s House entrance on this screen!');
    // Try all entrances on this screen as starting points
    console.log('Available entrances:', screenEntrances.map(e => `id=${e.id} room=${getEntranceRoomId(rom, e.id)}`));
    return;
  }

  console.log(`\nLink's House entrance found: entrance ${linksHouseEntrance.id} at grid (${linksHouseEntrance.gridRow}, ${linksHouseEntrance.gridCol})`);

  // Start flood-fill from Link's House exit position
  const startRow = linksHouseEntrance.gridRow;
  const startCol = linksHouseEntrance.gridCol;

  // If start position is blocked, search nearby for walkable
  let actualStart = { row: startRow, col: startCol };
  if (grid[startRow][startCol].type !== 'free') {
    console.log(`  Start position type: ${JSON.stringify(grid[startRow][startCol])}`);
    console.log(`  Nearby tiles:`);
    for (let dr = -4; dr <= 4; dr++) {
      let line = `    row ${startRow + dr}: `;
      for (let dc = -4; dc <= 4; dc++) {
        const r = startRow + dr, c = startCol + dc;
        if (r >= 0 && r < 64 && c >= 0 && c < 64) {
          const t = grid[r][c];
          line += t.type === 'free' ? '.' : t.type === 'blocked' ? '#' : t.type === 'obstacle' ? 'O' : t.type === 'water' ? '~' : t.type[0];
        }
      }
      console.log(line);
    }
    console.log(`  Searching wider radius (8 tiles)...`);
    let found = false;
    for (let dr = -8; dr <= 8 && !found; dr++) {
      for (let dc = -8; dc <= 8 && !found; dc++) {
        const r = startRow + dr, c = startCol + dc;
        if (r >= 0 && r < 64 && c >= 0 && c < 64 && grid[r][c].type === 'free') {
          actualStart = { row: r, col: c };
          found = true;
        }
      }
    }
    if (!found) {
      console.error('Could not find walkable tile near entrance!');
      return;
    }
    console.log(`  Using nearby walkable: (${actualStart.row}, ${actualStart.col})`);
  }

  // Entrance positions for the flood fill to detect
  const entranceGridPositions = screenEntrances.map(e => ({ row: e.gridRow, col: e.gridCol, idx: e.id }));

  console.log(`\nFlood-filling from (${actualStart.row}, ${actualStart.col})...`);
  const result = floodFill(grid, actualStart.row, actualStart.col, entranceGridPositions);

  // Report results
  console.log(`\n═══ FLOOD FILL RESULTS ═══`);
  console.log(`Reachable: ${result.reachableCount} / ${result.totalTiles} tiles (${(result.reachableCount / result.totalTiles * 100).toFixed(1)}%)`);

  // Group transitions by edge
  const byEdge: Record<string, TransitionPoint[]> = { north: [], south: [], east: [], west: [], entrance: [] };
  for (const t of result.transitions) byEdge[t.edge].push(t);

  console.log(`\n--- Reachable Screen Borders ---`);
  for (const edge of ['north', 'south', 'east', 'west'] as const) {
    const pts = byEdge[edge];
    if (pts.length === 0) {
      console.log(`  ${edge.toUpperCase()}: BLOCKED (no reachable border tiles)`);
    } else {
      const freeCount = pts.filter(p => p.requirements.length === 0).length;
      const reqCount = pts.filter(p => p.requirements.length > 0).length;
      const positions = pts.map(p => p.col !== undefined ? (edge === 'north' || edge === 'south' ? p.col : p.row) : -1);
      const minPos = Math.min(...positions);
      const maxPos = Math.max(...positions);
      const reqSet = new Set(pts.flatMap(p => p.requirements));

      console.log(`  ${edge.toUpperCase()}: ${pts.length} tiles reachable (positions ${minPos}-${maxPos})`);
      console.log(`    Free (no items): ${freeCount} tiles`);
      if (reqCount > 0) {
        console.log(`    With items: ${reqCount} tiles (needs: ${[...reqSet].join(', ')})`);
      }
    }
  }

  console.log(`\n--- Reachable Entrances ---`);
  for (const t of byEdge.entrance) {
    const ent = screenEntrances.find(e => e.id === t.entranceIdx);
    const roomId = ent ? getEntranceRoomId(rom, ent.id) : -1;
    console.log(`  Entrance ${t.entranceIdx} → Room ${roomId} (0x${roomId.toString(16)}) at (${t.row}, ${t.col})`);
    if (t.requirements.length > 0) {
      console.log(`    Requires: ${t.requirements.join(', ')}`);
    }
  }

  // Visual map (ASCII art of reachable area)
  console.log(`\n--- Reachable Area Map (64×64, '#'=reachable, '.'=blocked, 'E'=entrance, '|/-'=border) ---`);
  const entranceSet = new Set(screenEntrances.map(e => `${e.gridRow},${e.gridCol}`));
  for (let r = 0; r < 64; r += 2) { // Print every other row for compactness
    let line = '';
    for (let c = 0; c < 64; c += 2) { // Every other col
      const key = `${r},${c}`;
      if (entranceSet.has(key)) {
        line += 'E';
      } else if (result.reachable[r][c]) {
        line += '#';
      } else {
        line += '.';
      }
    }
    console.log(`  ${String(r).padStart(2)}|${line}|`);
  }
}

run();
