/**
 * Extract accurate overworld screen-to-screen connectivity from ROM tile data.
 *
 * The game has no explicit connectivity table — transitions are allowed/blocked
 * purely by tile collision attributes along screen borders.
 *
 * Pipeline:
 * 1. Decompress each screen → 256 Map32 IDs (16×16 grid)
 * 2. Decode Map32 → Map16 (4 lookup tables, 2×2 per Map32 = 32×32 Map16 per screen)
 * 3. Map16 → Map8 → collision attribute
 * 4. Scan borders between adjacent screens for walkable passages
 *
 * Usage: npx tsx scripts/extract-screen-connectivity.ts
 */
import { loadRom } from '../shared/asset-extraction/rom/rom-loader';
import { decompress } from '../shared/asset-extraction/compression/lz-decompress';
import type { RomData } from '../shared/asset-extraction/rom/rom-types';

// ─── ROM Addresses ───────────────────────────────────────────────────────────
const ADDR_AREA_HEADS = 0x82A5EC;       // kOverworldAreaHeads[64]
const ADDR_IS_SMALL = 0x82F88D;         // kOverworldMapIsSmall[192]
const ADDR_HI_PTRS = 0x82F94D;          // kOverworld_Hibytes_Comp pointers (160 × 3 bytes)
const ADDR_LO_PTRS = 0x82FB2D;          // kOverworld_Lobytes_Comp pointers (160 × 3 bytes)
const ADDR_MAP32_0 = 0x838000;          // kMap32ToMap16_0 (2218 groups × 6 bytes)
const ADDR_MAP32_1 = 0x83B400;          // kMap32ToMap16_1
const ADDR_MAP32_2 = 0x848000;          // kMap32ToMap16_2
const ADDR_MAP32_3 = 0x84B400;          // kMap32ToMap16_3
const ADDR_MAP16_TO_MAP8 = 0x8F8000;    // kMap16ToMap8 (3752 × 4 uint16)
const ADDR_MAP8_TO_ATTR = 0x8E9459;     // kMap8DataToTileAttr (512 bytes)

// ─── Tile Attribute Classification ──────────────────────────────────────────
// From tile_detect.c TileDetect_ExecuteInner
const WALKABLE_ATTRS = new Set([
  0x00, 0x04, 0x05, 0x06, 0x07, 0x09, 0x0a,
  0x14, 0x15, 0x16, 0x17,
  0x21, 0x23, 0x24, 0x25,
  0x38, 0x39, 0x3a, 0x3b, 0x3c,
  0x41, 0x45, 0x47, 0x49,
  0x5e, 0x5f, 0x61, 0x62, 0x64, 0x65, 0x66,
  0x6c, 0x6d, 0x6e, 0x6f, // walkable outdoors
  0xa6, 0xa7, 0xbe, 0xbf,
  ...Array.from({ length: 32 }, (_, i) => 0xd0 + i), // 0xd0-0xef
]);

// Ledge tiles — one-way in specific direction
const LEDGE_SOUTH = 0x28;  // can jump south (blocks northward)
const LEDGE_NORTH = 0x29;  // can jump north (blocks southward)
const LEDGE_EAST_WEST = new Set([0x2a, 0x2b]); // east/west ledges
const LEDGE_SOUTH_DIAG = new Set([0x2d, 0x2f]); // south diagonal
const LEDGE_NORTH_DIAG = new Set([0x2c, 0x2e]); // north diagonal

type TileClass = 'walk' | 'block' | 'ledge-s' | 'ledge-n' | 'ledge-e' | 'ledge-w' | 'water';

function classifyAttr(attr: number): TileClass {
  if (WALKABLE_ATTRS.has(attr)) return 'walk';
  if (attr === 0x08) return 'water';
  if (attr === LEDGE_SOUTH) return 'ledge-s'; // jump-south (can go south)
  if (attr === LEDGE_NORTH) return 'ledge-n'; // jump-north (can go north)
  if (LEDGE_EAST_WEST.has(attr)) return 'ledge-e'; // simplified
  if (LEDGE_SOUTH_DIAG.has(attr)) return 'ledge-s';
  if (LEDGE_NORTH_DIAG.has(attr)) return 'ledge-n';
  return 'block';
}

// ─── Data Loading ───────────────────────────────────────────────────────────

interface ScreenData {
  /** 32×32 grid of Map16 tile IDs */
  map16: Uint16Array;
}

function loadMap32Tables(rom: RomData) {
  // Each table has 2218 groups × 6 bytes = 13308 bytes
  const size = 2218 * 6;
  return {
    t0: rom.getBytes(ADDR_MAP32_0, size),
    t1: rom.getBytes(ADDR_MAP32_1, size),
    t2: rom.getBytes(ADDR_MAP32_2, size),
    t3: rom.getBytes(ADDR_MAP32_3, size),
  };
}

function loadMap16ToMap8(rom: RomData): Uint16Array {
  const words = rom.getWords(ADDR_MAP16_TO_MAP8, 3752 * 4);
  return Uint16Array.from(words);
}

function loadMap8ToAttr(rom: RomData): Uint8Array {
  const bytes = rom.getBytes(ADDR_MAP8_TO_ATTR, 512);
  return Uint8Array.from(bytes);
}

function loadAreaHeads(rom: RomData): number[] {
  const heads: number[] = [];
  for (let i = 0; i < 64; i++) heads.push(rom.getByte(ADDR_AREA_HEADS + i));
  return heads;
}

function loadIsSmall(rom: RomData): number[] {
  const flags: number[] = [];
  for (let i = 0; i < 192; i++) flags.push(rom.getByte(ADDR_IS_SMALL + i));
  return flags;
}

/**
 * Decode a Map32 tile ID into 4 Map16 tile IDs (TL, TR, BL, BR).
 */
function decodeMap32(
  map32Id: number,
  tables: { t0: Buffer; t1: Buffer; t2: Buffer; t3: Buffer },
): [number, number, number, number] {
  // Replicate C logic from Overworld_ParseMap32Definition
  const input = map32Id * 2;
  const a = input & ~7;
  const x = (a >> 1) + (a >> 2); // byte offset into table (group × 6)
  const sel = input & 7; // 0, 2, 4, or 6

  function readMap16(table: Buffer): number {
    const ov0 = table[x + (sel >> 1)]; // main byte
    const nibbleByte = table[x + 4 + (sel >> 2)]; // nibble byte
    const nibble = (sel & 2) ? (nibbleByte & 0x0f) : (nibbleByte >> 4);
    return ov0 | (nibble << 8);
  }

  return [
    readMap16(tables.t0), // top-left
    readMap16(tables.t1), // top-right
    readMap16(tables.t2), // bottom-left
    readMap16(tables.t3), // bottom-right
  ];
}

/**
 * Decompress and decode one screen to a 32×32 Map16 grid.
 */
function decompressScreen(rom: RomData, screenIdx: number, tables: ReturnType<typeof loadMap32Tables>): ScreenData {
  // Get compressed data addresses
  const hiAddr = rom.get24(ADDR_HI_PTRS + screenIdx * 3);
  const loAddr = rom.get24(ADDR_LO_PTRS + screenIdx * 3);

  // Decompress hi and lo bytes
  const hiBuf = decompress(hiAddr, (a) => rom.getByte(a), false);
  const loBuf = decompress(loAddr, (a) => rom.getByte(a), false);

  // Interleave into 256 Map32 IDs (16-bit each)
  const map32Ids = new Uint16Array(256);
  for (let i = 0; i < 256; i++) {
    map32Ids[i] = loBuf[i] | (hiBuf[i] << 8);
  }

  // Decode Map32 → Map16 (16×16 Map32 → 32×32 Map16)
  const map16 = new Uint16Array(32 * 32);
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const map32Id = map32Ids[row * 16 + col];
      const [tl, tr, bl, br] = decodeMap32(map32Id, tables);
      const dstRow = row * 2;
      const dstCol = col * 2;
      map16[(dstRow) * 32 + dstCol] = tl;
      map16[(dstRow) * 32 + dstCol + 1] = tr;
      map16[(dstRow + 1) * 32 + dstCol] = bl;
      map16[(dstRow + 1) * 32 + dstCol + 1] = br;
    }
  }

  return { map16 };
}

/**
 * Get collision attribute for a Map16 tile at a specific sub-position.
 * subIdx: 0=TL, 1=TR, 2=BL, 3=BR (matching game's (y&8)>>2 | (x&1) pattern)
 */
function getCollisionAttr(
  map16Id: number,
  subIdx: number,
  map16ToMap8: Uint16Array,
  map8ToAttr: Uint8Array,
): number {
  const map8Entry = map16ToMap8[map16Id * 4 + subIdx];
  return map8ToAttr[map8Entry & 0x1ff];
}

/**
 * Classify a Map16 tile for border crossing. Checks relevant sub-tiles based on direction.
 * For a south border: check bottom sub-tiles (2, 3)
 * For a north border: check top sub-tiles (0, 1)
 * For an east border: check right sub-tiles (1, 3)
 * For a west border: check left sub-tiles (0, 2)
 */
function classifyBorderTile(
  map16Id: number,
  direction: 'north' | 'south' | 'east' | 'west',
  map16ToMap8: Uint16Array,
  map8ToAttr: Uint8Array,
): TileClass {
  let subs: number[];
  switch (direction) {
    case 'north': subs = [0, 1]; break;
    case 'south': subs = [2, 3]; break;
    case 'west': subs = [0, 2]; break;
    case 'east': subs = [1, 3]; break;
  }

  const classes = subs.map(s => classifyAttr(getCollisionAttr(map16Id, s, map16ToMap8, map8ToAttr)));

  // If any sub-tile is walkable, consider it walkable
  if (classes.some(c => c === 'walk')) return 'walk';
  // Check for ledges
  if (classes.some(c => c.startsWith('ledge'))) return classes.find(c => c.startsWith('ledge'))!;
  // Water
  if (classes.some(c => c === 'water')) return 'water';
  return 'block';
}

// ─── Border Analysis ─────────────────────────────────────────────────────────

type Direction = 'east' | 'south';

interface BorderResult {
  fromScreen: number;
  toScreen: number;
  direction: Direction;
  classification: 'two-way' | 'one-way-forward' | 'one-way-reverse' | 'swim' | 'blocked';
  walkablePositions: number; // how many tile positions have walkable passage
}

/**
 * Check if a full tile (all 4 sub-tiles) has any walkable sub-tile.
 */
function isTileWalkable(
  map16Id: number,
  map16ToMap8: Uint16Array,
  map8ToAttr: Uint8Array,
): boolean {
  for (let s = 0; s < 4; s++) {
    const attr = getCollisionAttr(map16Id, s, map16ToMap8, map8ToAttr);
    const cls = classifyAttr(attr);
    if (cls === 'walk') return true;
  }
  return false;
}

/** Depth to check inward from border to verify reachability */
const DEPTH_CHECK = 4;

/**
 * Check if a border position is reachable from inside the screen.
 * Verifies there's a corridor of walkable tiles from depth DEPTH_CHECK inward to the border.
 * Link is 16px wide, so we also check adjacent columns for a 2-wide corridor.
 */
function isBorderReachable(
  data: ScreenData,
  position: number, // column (for N/S borders) or row (for E/W borders)
  side: 'south' | 'north' | 'east' | 'west', // which border of this screen
  map16ToMap8: Uint16Array,
  map8ToAttr: Uint8Array,
): boolean {
  // Check tiles from the border inward for DEPTH_CHECK rows/cols
  for (let depth = 0; depth < DEPTH_CHECK; depth++) {
    let row: number, col: number;

    if (side === 'south') {
      row = 31 - depth;
      col = position;
    } else if (side === 'north') {
      row = depth;
      col = position;
    } else if (side === 'east') {
      row = position;
      col = 31 - depth;
    } else {
      row = position;
      col = depth;
    }

    const tileId = data.map16[row * 32 + col];
    if (!isTileWalkable(tileId, map16ToMap8, map8ToAttr)) {
      return false;
    }
  }
  return true;
}

/**
 * Analyze the border between two adjacent screens.
 * For east/west: fromScreen is west, toScreen is east
 * For north/south: fromScreen is north, toScreen is south
 *
 * Checks BOTH border tiles AND reachability (corridor from interior to border).
 */
function analyzeBorder(
  fromData: ScreenData,
  toData: ScreenData,
  direction: Direction,
  map16ToMap8: Uint16Array,
  map8ToAttr: Uint8Array,
): BorderResult['classification'] & { walkCount: number; ledgeCount: number } {
  let walkCount = 0;
  let ledgeSouthCount = 0;
  let ledgeNorthCount = 0;
  let ledgeEastCount = 0;

  const borderSize = 32;

  for (let i = 0; i < borderSize; i++) {
    let fromTileId: number;
    let toTileId: number;
    let fromDir: 'north' | 'south' | 'east' | 'west';
    let toDir: 'north' | 'south' | 'east' | 'west';
    let fromSide: 'south' | 'north' | 'east' | 'west';
    let toSide: 'south' | 'north' | 'east' | 'west';

    if (direction === 'south') {
      fromTileId = fromData.map16[31 * 32 + i];
      toTileId = toData.map16[0 * 32 + i];
      fromDir = 'south';
      toDir = 'north';
      fromSide = 'south';
      toSide = 'north';
    } else {
      fromTileId = fromData.map16[i * 32 + 31];
      toTileId = toData.map16[i * 32 + 0];
      fromDir = 'east';
      toDir = 'west';
      fromSide = 'east';
      toSide = 'west';
    }

    const fromClass = classifyBorderTile(fromTileId, fromDir, map16ToMap8, map8ToAttr);
    const toClass = classifyBorderTile(toTileId, toDir, map16ToMap8, map8ToAttr);

    // Both border tiles walkable — now verify reachability from interior
    if (fromClass === 'walk' && toClass === 'walk') {
      const fromReachable = isBorderReachable(fromData, i, fromSide, map16ToMap8, map8ToAttr);
      const toReachable = isBorderReachable(toData, i, toSide, map16ToMap8, map8ToAttr);
      if (fromReachable && toReachable) {
        walkCount++;
      }
    }
    // Ledge checks (also verify reachability)
    else if (direction === 'south' && fromClass === 'ledge-s' && toClass === 'walk') {
      if (isBorderReachable(fromData, i, fromSide, map16ToMap8, map8ToAttr) &&
          isBorderReachable(toData, i, toSide, map16ToMap8, map8ToAttr)) {
        ledgeSouthCount++;
      }
    }
    else if (direction === 'south' && fromClass === 'walk' && toClass === 'ledge-n') {
      if (isBorderReachable(fromData, i, fromSide, map16ToMap8, map8ToAttr) &&
          isBorderReachable(toData, i, toSide, map16ToMap8, map8ToAttr)) {
        ledgeNorthCount++;
      }
    }
    else if (direction === 'east' && fromClass === 'ledge-e' && toClass === 'walk') {
      if (isBorderReachable(fromData, i, fromSide, map16ToMap8, map8ToAttr) &&
          isBorderReachable(toData, i, toSide, map16ToMap8, map8ToAttr)) {
        ledgeEastCount++;
      }
    }
  }

  return { walkCount, ledgeCount: direction === 'south' ? ledgeSouthCount + ledgeNorthCount : ledgeEastCount };
}

// ─── Screen Names ────────────────────────────────────────────────────────────

const LW_NAMES: Record<number, string> = {
  0x00: 'Lost Woods NW', 0x01: 'Lost Woods NE', 0x02: 'Lumberjack Estate', 0x03: 'Tower of Hera NW',
  0x04: 'Tower of Hera NE', 0x05: 'Death Mountain Bridge NW', 0x06: 'Death Mountain Bridge NE', 0x07: 'Turtle Rock',
  0x08: 'Lost Woods SW', 0x09: 'Lost Woods SE', 0x0A: 'Death Mountain Gateway', 0x0B: 'Tower of Hera SW',
  0x0C: 'Tower of Hera SE', 0x0D: 'Mountain Bridge SW', 0x0E: 'Mountain Bridge SE', 0x0F: 'Zora Falls Outskirts',
  0x10: 'Lost Woods Outskirts', 0x11: 'Kakariko Psychics', 0x12: 'Northern Pond', 0x13: 'Sanctuary Grounds',
  0x14: 'Graveyard', 0x15: 'South Bend', 0x16: 'Coven of Commerce', 0x17: 'Zora Ridge',
  0x18: 'Kakariko NW', 0x19: 'Kakariko NE', 0x1A: 'Central Hyrule NW', 0x1B: 'Hyrule Castle NW',
  0x1C: 'Hyrule Castle NE', 0x1D: 'Castle East Bridge', 0x1E: 'Eastern Ruins NW', 0x1F: 'Eastern Ruins NE',
  0x20: 'Kakariko SW', 0x21: 'Kakariko SE', 0x22: 'Central Hyrule SW', 0x23: 'Hyrule Castle SW',
  0x24: 'Hyrule Castle SE', 0x25: 'Castle South Bridge', 0x26: 'Eastern Ruins SW', 0x27: 'Eastern Ruins SE',
  0x28: 'Kakariko Maze', 0x29: 'Kakariko South Annex', 0x2A: 'Twin Bridges', 0x2B: "Uncle's Estate West",
  0x2C: "Uncle's Estate East", 0x2D: 'Hylia Shore NW', 0x2E: 'Eastern Peninsula', 0x2F: 'Eastern Coast',
  0x30: 'Desert of Mystery NW', 0x31: 'Desert of Mystery NE', 0x32: 'Central Woods', 0x33: 'Dam Headwaters',
  0x34: 'Hyrule Wetlands NE', 0x35: 'Lake Hylia NW', 0x36: 'Lake Hylia NE', 0x37: 'Lake Hylia Shore',
  0x38: 'Desert of Mystery SW', 0x39: 'Desert of Mystery SE', 0x3A: 'Great Swamp', 0x3B: 'Dam South',
  0x3C: 'Hyrule Wetlands Terrace', 0x3D: 'Lake Hylia SW', 0x3E: 'Lake Hylia SE', 0x3F: 'Lake Hylia Islands',
};

const DW_NAMES: Record<number, string> = {
  0x00: 'Skull Woods NW', 0x01: 'Skull Woods NE', 0x02: 'Eastern Skull Clearing', 0x03: "Ganon's Tower NW",
  0x04: "Ganon's Tower NE", 0x05: 'DW Death Mountain Bridge NW', 0x06: 'DW Death Mountain Bridge NE', 0x07: 'Turtle Rock',
  0x08: 'Skull Woods SW', 0x09: 'Skull Woods SE', 0x0A: 'Bungie Cave Fun Zone', 0x0B: "Ganon's Tower SW",
  0x0C: "Ganon's Tower SE", 0x0D: 'DW Death Mountain Bridge SW', 0x0E: 'DW Death Mountain Bridge SE', 0x0F: 'DW Zora Falls',
  0x10: 'Skull Forest Outskirts', 0x11: 'VoO Psychics', 0x12: 'DW Northern Pond', 0x13: 'DW Sanctuary Grounds',
  0x14: 'DW Graveyard', 0x15: 'DW South Bend', 0x16: 'DW Coven of Commerce', 0x17: 'DW Zora Ridge',
  0x18: 'Village of Outcasts NW', 0x19: 'Village of Outcasts NE', 0x1A: 'DW Central NW', 0x1B: 'Pyramid NW',
  0x1C: 'Pyramid NE', 0x1D: 'DW Castle East Bridge', 0x1E: 'Palace of Darkness NW', 0x1F: 'Palace of Darkness NE',
  0x20: 'Village of Outcasts SW', 0x21: 'Village of Outcasts SE', 0x22: 'DW Central SW', 0x23: 'Pyramid SW',
  0x24: 'Pyramid SE', 0x25: 'DW Castle South Bridge', 0x26: 'Palace of Darkness SW', 0x27: 'Palace of Darkness SE',
  0x28: 'Dark Maze', 0x29: 'Archery Shop Grounds', 0x2A: 'DW Twin Bridges', 0x2B: 'Bomb Shop Estate West',
  0x2C: 'Bomb Shop Estate East', 0x2D: 'DW Hylia Shore NW', 0x2E: 'DW Eastern Peninsula', 0x2F: 'DW Eastern Coast',
  0x30: 'Swamp of Evil NW', 0x31: 'Swamp of Evil NE', 0x32: 'DW Central Woods', 0x33: 'DW Dam Headwaters',
  0x34: 'DW Hyrule Wetlands NE', 0x35: 'Ice Palace NW', 0x36: 'Ice Palace NE', 0x37: 'DW Lake Shore',
  0x38: 'Swamp of Evil SW', 0x39: 'Swamp of Evil SE', 0x3A: 'Misery Mire', 0x3B: 'DW Dam South',
  0x3C: 'DW Wetlands Terrace', 0x3D: 'Ice Palace SW', 0x3E: 'Ice Palace SE', 0x3F: 'DW Lake Islands',
};

// ─── Main Extraction ─────────────────────────────────────────────────────────

interface Connection {
  from: string;
  to: string;
  entrance: string;
  tags: string[];
}

function run() {
  const romPath = 'test-roms/Legend of Zelda, The - A Link to the Past (USA).sfc';
  console.log('Loading ROM...');
  const rom = loadRom(romPath);

  console.log('Loading lookup tables...');
  const map32Tables = loadMap32Tables(rom);
  const map16ToMap8 = loadMap16ToMap8(rom);
  const map8ToAttr = loadMap8ToAttr(rom);
  const areaHeads = loadAreaHeads(rom);
  const isSmall = loadIsSmall(rom);

  // Decompress all 128 overworld screens (0-63 LW, 64-127 DW)
  console.log('Decompressing screens...');
  const screens: ScreenData[] = [];
  for (let i = 0; i < 128; i++) {
    screens.push(decompressScreen(rom, i, map32Tables));
  }

  // Determine big-area groupings
  // For LW (0-63): areaHeads[i] gives the head screen
  // For DW (64-127): areaHeads[i-64] + 64 gives the head
  function getHead(screen: number): number {
    const local = screen & 63;
    const head = areaHeads[local];
    return (screen >= 64) ? head + 64 : head;
  }

  function isBigArea(screen: number): boolean {
    return !isSmall[screen];
  }

  // Generate connections for both worlds
  const lwConnections: Connection[] = [];
  const dwConnections: Connection[] = [];

  for (let world = 0; world < 2; world++) {
    const offset = world * 64;
    const prefix = world === 0 ? 'lw' : 'dw';
    const names = world === 0 ? LW_NAMES : DW_NAMES;
    const connections = world === 0 ? lwConnections : dwConnections;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const screen = row * 8 + col;
        const screenIdx = screen + offset;

        // Check EAST neighbor
        if (col < 7) {
          const neighbor = screen + 1;
          const neighborIdx = neighbor + offset;

          // Skip if same big area (internally always connected)
          if (getHead(screenIdx) === getHead(neighborIdx)) continue;

          const result = analyzeBorder(screens[screenIdx], screens[neighborIdx], 'east', map16ToMap8, map8ToAttr);
          const fromName = names[screen] || `Screen ${screen.toString(16).padStart(2, '0')}`;
          const toName = names[neighbor] || `Screen ${neighbor.toString(16).padStart(2, '0')}`;

          if (result.walkCount >= 2) {
            connections.push({
              from: `${prefix}-${screen.toString(16).padStart(2, '0')}`,
              to: `${prefix}-${neighbor.toString(16).padStart(2, '0')}`,
              entrance: `${fromName} East to ${toName}`,
              tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'],
            });
          } else if (result.walkCount === 1) {
            // Marginal — might be a tight passage
            connections.push({
              from: `${prefix}-${screen.toString(16).padStart(2, '0')}`,
              to: `${prefix}-${neighbor.toString(16).padStart(2, '0')}`,
              entrance: `${fromName} East to ${toName}`,
              tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'note:narrow'],
            });
          } else if (result.ledgeCount > 0) {
            connections.push({
              from: `${prefix}-${screen.toString(16).padStart(2, '0')}`,
              to: `${prefix}-${neighbor.toString(16).padStart(2, '0')}`,
              entrance: `${fromName} East to ${toName}`,
              tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'],
            });
          }
          // else: blocked, no connection
        }

        // Check SOUTH neighbor
        if (row < 7) {
          const neighbor = screen + 8;
          const neighborIdx = neighbor + offset;

          // Skip if same big area
          if (getHead(screenIdx) === getHead(neighborIdx)) continue;

          const result = analyzeBorder(screens[screenIdx], screens[neighborIdx], 'south', map16ToMap8, map8ToAttr);
          const fromName = names[screen] || `Screen ${screen.toString(16).padStart(2, '0')}`;
          const toName = names[neighbor] || `Screen ${neighbor.toString(16).padStart(2, '0')}`;

          if (result.walkCount >= 2) {
            connections.push({
              from: `${prefix}-${screen.toString(16).padStart(2, '0')}`,
              to: `${prefix}-${neighbor.toString(16).padStart(2, '0')}`,
              entrance: `${fromName} South to ${toName}`,
              tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'],
            });
          } else if (result.walkCount === 1) {
            connections.push({
              from: `${prefix}-${screen.toString(16).padStart(2, '0')}`,
              to: `${prefix}-${neighbor.toString(16).padStart(2, '0')}`,
              entrance: `${fromName} South to ${toName}`,
              tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'note:narrow'],
            });
          } else if (result.ledgeCount > 0) {
            connections.push({
              from: `${prefix}-${screen.toString(16).padStart(2, '0')}`,
              to: `${prefix}-${neighbor.toString(16).padStart(2, '0')}`,
              entrance: `${fromName} South to ${toName}`,
              tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'],
            });
          }
        }
      }
    }

    // Add internal big-area connections (always connected by scrolling)
    const processedHeads = new Set<number>();
    for (let i = 0; i < 64; i++) {
      const head = areaHeads[i];
      if (head === i && !isSmall[i + offset]) {
        // This is a big area head — connect all 4 sub-screens
        if (processedHeads.has(head)) continue;
        processedHeads.add(head);

        const tl = head, tr = head + 1, bl = head + 8, br = head + 9;
        const ids = [tl, tr, bl, br].map(s => `${prefix}-${s.toString(16).padStart(2, '0')}`);
        const screenNames = [tl, tr, bl, br].map(s => names[s] || `Screen ${s.toString(16).padStart(2, '0')}`);

        // Connect TL↔TR, TL↔BL, TR↔BR, BL↔BR (all internal)
        connections.push(
          { from: ids[0], to: ids[1], entrance: `${screenNames[0]} East to ${screenNames[1]}`, tags: ['transit:scroll', 'dir:two-way', 'ctx:overworld', 'big-area'] },
          { from: ids[0], to: ids[2], entrance: `${screenNames[0]} South to ${screenNames[2]}`, tags: ['transit:scroll', 'dir:two-way', 'ctx:overworld', 'big-area'] },
          { from: ids[1], to: ids[3], entrance: `${screenNames[1]} South to ${screenNames[3]}`, tags: ['transit:scroll', 'dir:two-way', 'ctx:overworld', 'big-area'] },
          { from: ids[2], to: ids[3], entrance: `${screenNames[2]} East to ${screenNames[3]}`, tags: ['transit:scroll', 'dir:two-way', 'ctx:overworld', 'big-area'] },
        );
      }
    }
  }

  // Output results
  console.log(`\n═══ LIGHT WORLD CONNECTIONS (${lwConnections.length}) ═══`);
  console.log('Big-area (internal scroll):', lwConnections.filter(c => c.tags.includes('big-area')).length);
  console.log('Two-way walk:', lwConnections.filter(c => c.tags.includes('dir:two-way') && !c.tags.includes('big-area')).length);
  console.log('One-way ledge:', lwConnections.filter(c => c.tags.includes('dir:one-way')).length);
  console.log('Narrow passages:', lwConnections.filter(c => c.tags.includes('note:narrow')).length);

  console.log(`\n═══ DARK WORLD CONNECTIONS (${dwConnections.length}) ═══`);
  console.log('Big-area (internal scroll):', dwConnections.filter(c => c.tags.includes('big-area')).length);
  console.log('Two-way walk:', dwConnections.filter(c => c.tags.includes('dir:two-way') && !c.tags.includes('big-area')).length);
  console.log('One-way ledge:', dwConnections.filter(c => c.tags.includes('dir:one-way')).length);
  console.log('Narrow passages:', dwConnections.filter(c => c.tags.includes('note:narrow')).length);

  // Print detailed results
  console.log('\n═══ LIGHT WORLD DETAIL ═══');
  for (const c of lwConnections) {
    if (c.tags.includes('big-area')) continue;
    const type = c.tags.includes('dir:one-way') ? '→' : '↔';
    const narrow = c.tags.includes('note:narrow') ? ' [NARROW]' : '';
    console.log(`  ${c.from} ${type} ${c.to}: ${c.entrance}${narrow}`);
  }

  console.log('\n═══ DARK WORLD DETAIL ═══');
  for (const c of dwConnections) {
    if (c.tags.includes('big-area')) continue;
    const type = c.tags.includes('dir:one-way') ? '→' : '↔';
    const narrow = c.tags.includes('note:narrow') ? ' [NARROW]' : '';
    console.log(`  ${c.from} ${type} ${c.to}: ${c.entrance}${narrow}`);
  }

  // Also output the "missing" connections (grid-adjacent but blocked)
  console.log('\n═══ BLOCKED BORDERS (grid-adjacent but no passage) ═══');
  for (let world = 0; world < 2; world++) {
    const offset = world * 64;
    const prefix = world === 0 ? 'lw' : 'dw';
    const names = world === 0 ? LW_NAMES : DW_NAMES;
    const connections = world === 0 ? lwConnections : dwConnections;

    console.log(`\n--- ${world === 0 ? 'Light World' : 'Dark World'} ---`);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const screen = row * 8 + col;
        const screenIdx = screen + offset;
        const fromId = `${prefix}-${screen.toString(16).padStart(2, '0')}`;

        if (col < 7) {
          const neighbor = screen + 1;
          const neighborIdx = neighbor + offset;
          if (getHead(screenIdx) !== getHead(neighborIdx)) {
            const toId = `${prefix}-${neighbor.toString(16).padStart(2, '0')}`;
            if (!connections.some(c => c.from === fromId && c.to === toId)) {
              console.log(`  BLOCKED: ${fromId} (${names[screen]}) ↛ east ↛ ${toId} (${names[neighbor]})`);
            }
          }
        }
        if (row < 7) {
          const neighbor = screen + 8;
          const neighborIdx = neighbor + offset;
          if (getHead(screenIdx) !== getHead(neighborIdx)) {
            const toId = `${prefix}-${neighbor.toString(16).padStart(2, '0')}`;
            if (!connections.some(c => c.from === fromId && c.to === toId)) {
              console.log(`  BLOCKED: ${fromId} (${names[screen]}) ↛ south ↛ ${toId} (${names[neighbor]})`);
            }
          }
        }
      }
    }
  }

  // Output as TypeScript
  console.log('\n\n═══ TYPESCRIPT OUTPUT ═══');
  console.log('// Copy this into screen-adjacency.ts');
  function printConnections(conns: Connection[], varName: string) {
    console.log(`\nexport const ${varName}: RegionConnection[] = [`);
    for (const c of conns) {
      const tagsStr = c.tags.map(t => `'${t}'`).join(', ');
      console.log(`  { from: '${c.from}', to: '${c.to}', entrance: '${c.entrance.replace(/'/g, "\\'")}', tags: [${tagsStr}] },`);
    }
    console.log('];');
  }
  printConnections(lwConnections, 'LW_SCREEN_ADJACENCY_CONNECTIONS');
  printConnections(dwConnections, 'DW_SCREEN_ADJACENCY_CONNECTIONS');
}

run();
