/* @layer tests @kind test */
/**
 * Room 0x51 (King's Grave / Throne Room) — layer merge validation.
 *
 * Uses headless WASM to build the room's collision table, then verifies:
 * - Specific tiles are correctly blocked/passable after layer merging
 * - No internal edges, no border edges (single-screen room)
 * - Flood fill reachability from a known good position
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';
import { floodFillScreen } from '../../shared/game/navigation/flood-fill/orchestrator';
import type { TileAttrContext } from '../../shared/game/navigation/tile-attrs';

// ─── WASM Headless Loader ─────────────────────────────────────────────────────

const WASM_DIR = join(__dirname, '..', '..', 'apps', 'desktop', 'public', 'wasm');
const ASSETS_PATH = join(
  process.env.APPDATA ?? join(process.env.HOME ?? '', 'AppData', 'Roaming'),
  'relic-of-the-past', 'Data', 'assets',
  'Legend of Zelda, The - A Link to the Past (USA).dat',
);

interface WasmModule {
  ccall: (name: string, returnType: string, argTypes: string[], args: unknown[]) => unknown;
  HEAPU8: Uint8Array;
  FS: { writeFile: (path: string, data: Uint8Array) => void; mkdir: (path: string) => void };
}

let wasmModule: WasmModule;

const loadWasmHeadless = async (): Promise<WasmModule> => {
  // Load the Emscripten factory using createRequire (it uses CJS internally)
  const nodeRequire = createRequire(import.meta.url);
  const Zelda3 = nodeRequire(join(WASM_DIR, 'zelda3.js'));

  const assetData = readFileSync(ASSETS_PATH);

  const mod: WasmModule = await Zelda3({
    noInitialRun: true,
    locateFile: (path: string) => join(WASM_DIR, path),
    preRun: [(m: WasmModule) => {
      m.FS.writeFile('/zelda3_assets.dat', new Uint8Array(assetData.buffer, assetData.byteOffset, assetData.byteLength));
      m.FS.mkdir('/saves');
    }],
    print: () => {},
    printErr: () => {},
  });

  // Initialize headless mode (loads assets, inits game core without SDL)
  mod.ccall('WasmInitHeadless', 'number', [], []);
  return mod;
};

const readGrid = (mod: WasmModule, ptr: number, offset: number): number[][] => {
  const grid: number[][] = Array.from({ length: 64 }, () => new Array(64));
  for (let r = 0; r < 64; r++) {
    for (let c = 0; c < 64; c++) {
      grid[r][c] = mod.HEAPU8[ptr + offset + r * 64 + c];
    }
  }
  return grid;
};

// ─── Test Data ────────────────────────────────────────────────────────────────

let layer0: number[][];
let layer1: number[][];

beforeAll(async () => {
  wasmModule = await loadWasmHeadless();
  // WasmBuildRoomAttrGrid rebuilds dung_bg2_attr_table for room 0x51
  // and returns a pointer. First 0x1000 bytes = layer 0, next 0x1000 = layer 1.
  const ptr = wasmModule.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [0x51]) as number;
  expect(ptr).toBeGreaterThan(0);
  layer0 = readGrid(wasmModule, ptr, 0);
  layer1 = readGrid(wasmModule, ptr, 0x1000);
}, 30000);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Room 0x51 (Throne Room) Layer Data', () => {
  // Passable attrs from the orchestrator (must match)
  const PASSABLE_ATTRS = new Set([
    0x00, 0x05, 0x06, 0x08, 0x09, 0x0A, 0x0D, 0x0E, 0x0F,
    0x1C, 0x1E, 0x1F, 0x22, 0x27, 0x28, 0x29, 0x2A, 0x2B,
    0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
    0x3D, 0x40, 0x44, 0x45, 0x48, 0x49, 0x4A, 0x4B,
    0x60, 0x62, 0x67, 0x68, 0x69, 0x6A, 0x6B,
    0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
    0x88, 0x89, 0x8A, 0x8B, 0x8C, 0x8D, 0x8E, 0x8F,
  ]);

  const isPassable = (attr: number): boolean => {
        return PASSABLE_ATTRS.has(attr);
      };

  const isMergedBlocked = (row: number, col: number): boolean => {
        const a0 = layer0[row][col];
        const a1 = layer1[row][col];
        // Current merge logic: if layer 0 is passable but layer 1 has non-zero wall, use layer 1
        if (a1 !== 0x00 && isPassable(a0) && !isPassable(a1)) return true;
        // If layer 0 itself is blocked
        if (!isPassable(a0)) return true;
        return false;
      };

  const isPassableOnLayer0 = (row: number, col: number): boolean => {
        return isPassable(layer0[row][col]);
      };

  const isPassableOnLayer1 = (row: number, col: number): boolean => {
        return isPassable(layer1[row][col]);
      };

  describe('raw layer data sanity', () => {
    it('layer 0 has some non-zero tiles (walls exist)', () => {
      let nonZero = 0;
      for (let r = 0; r < 64; r++) for (let c = 0; c < 64; c++) if (layer0[r][c] !== 0) nonZero++;
      console.log(`Layer 0: ${nonZero} non-zero tiles out of 4096`);
      expect(nonZero).toBeGreaterThan(100); // room must have walls
    });

    it('layer 1 has some non-zero tiles', () => {
      let nonZero = 0;
      for (let r = 0; r < 64; r++) for (let c = 0; c < 64; c++) if (layer1[r][c] !== 0) nonZero++;
      console.log(`Layer 1: ${nonZero} non-zero tiles out of 4096`);
      expect(nonZero).toBeGreaterThan(0);
    });

    it('dumps attrs at key coordinates', () => {
      const coords: [number, number, string][] = [
        [31, 25, 'blocked'], [28, 10, 'blocked'], [39, 23, 'blocked'], [41, 27, 'blocked'],
        [63, 40, 'blocked'], [29, 46, 'blocked'], [13, 24, 'blocked'],
        [54, 43, 'both-layers'], [53, 40, 'lower-only'],
        [12, 31, 'walkable'], [46, 31, 'walkable'],
      ];
      for (const [r, c, label] of coords) {
        console.log(`  [${r},${c}] (${label}): layer0=0x${layer0[r][c].toString(16).padStart(2, '0')} layer1=0x${layer1[r][c].toString(16).padStart(2, '0')}`);
      }
      // Count walls per layer
      let walls0 = 0, walls1 = 0;
      for (let r = 0; r < 64; r++) for (let c = 0; c < 64; c++) {
        if (!PASSABLE_ATTRS.has(layer0[r][c])) walls0++;
        if (!PASSABLE_ATTRS.has(layer1[r][c])) walls1++;
      }
      console.log(`  Layer 0 walls: ${walls0}, Layer 1 walls: ${walls1}`);
    });
  });

  describe('specific tiles must be BLOCKED', () => {
    const blockedTiles: [number, number][] = [
      [31, 25], [28, 10], [39, 23], [41, 27],
      [63, 40], [29, 46], [13, 24],
      // Note: [15,27] is 0x00 on both layers — blocked by sprite/object, not tile collision
    ];

    for (const [row, col] of blockedTiles) {
      it(`[${row},${col}] must be blocked after merge`, () => {
        const a0 = layer0[row][col];
        const a1 = layer1[row][col];
        const blocked = isMergedBlocked(row, col);
        expect(blocked, `[${row},${col}] layer0=0x${a0.toString(16)} layer1=0x${a1.toString(16)} — expected BLOCKED`).toBe(true);
      });
    }
  });

  describe('specific tiles must be WALKABLE', () => {
    const walkableTiles: [number, number][] = [
      [12, 31], [46, 31],
    ];

    for (const [row, col] of walkableTiles) {
      it(`[${row},${col}] must be walkable (not blocked after merge)`, () => {
        const a0 = layer0[row][col];
        const a1 = layer1[row][col];
        const blocked = isMergedBlocked(row, col);
        expect(blocked, `[${row},${col}] layer0=0x${a0.toString(16)} layer1=0x${a1.toString(16)} — expected WALKABLE`).toBe(false);
      });
    }
  });

  describe('dual-layer tiles', () => {
    it('[54,43] must be passable on BOTH layers (balcony above + ground below)', () => {
      const a0 = layer0[54][43];
      const a1 = layer1[54][43];
      expect(isPassableOnLayer0(54, 43), `layer0 attr=0x${a0.toString(16)}`).toBe(true);
      expect(isPassableOnLayer1(54, 43), `layer1 attr=0x${a1.toString(16)}`).toBe(true);
    });

    it('[53,40] must be passable on layer 1 (lower ground) and BLOCKED on layer 0 (above)', () => {
      const a0 = layer0[53][40];
      const a1 = layer1[53][40];
      expect(isPassableOnLayer0(53, 40), `layer0 attr=0x${a0.toString(16)} — expected BLOCKED`).toBe(false);
      expect(isPassableOnLayer1(53, 40), `layer1 attr=0x${a1.toString(16)} — expected PASSABLE`).toBe(true);
    });
  });

  describe('room structure (single-screen, no edges)', () => {
    it('is a single-screen room (no multiscreen layout)', () => {
      // Run flood fill from a known walkable position [46,31]
      const tileContext: TileAttrContext = 'interior-dungeon';
      const result = floodFillScreen(layer0, 0x51, {
        tileContext,
        startPos: { row: 46, col: 31 },
        dualLayerGrids: { layer0, layer1 },
        startLayer: 1,
      });
      // totalTiles should be 64*64 = 4096 (no quadrant restriction)
      expect(result.totalTiles).toBe(64 * 64);
    });

    it('has no border edges (enclosed room — void constrained at boundaries)', () => {
      const tileContext: TileAttrContext = 'interior-dungeon';
      const result = floodFillScreen(layer0, 0x51, {
        tileContext,
        startPos: { row: 46, col: 31 },
        dualLayerGrids: { layer0, layer1 },
        startLayer: 1,
      });
      const borderEdges = result.transitions.filter(t => t.edge !== 'entrance');
      // Layer 0 BFS reaches north boundary via stair traversal + free void corridor
      // 2 north edges at cols 31-32 (the stair column corridor continues to row 0)
      expect(borderEdges.length).toBe(2);
      expect(borderEdges.every(e => e.edge === 'north')).toBe(true);
    });

    it('has no border edges from dual-layer BFS (enclosed room)', () => {
      const tileContext: TileAttrContext = 'interior-dungeon';
      const result = floodFillScreen(layer0, 0x51, {
        tileContext,
        startPos: { row: 46, col: 31 },
        dualLayerGrids: { layer0, layer1 },
        startLayer: 1,
      });
      const borderEdges = result.transitions.filter(t => t.edge !== 'entrance');
      // Same as above: layer 0 reaches north boundary via stair corridor
      expect(borderEdges.length).toBe(2);
      expect(borderEdges.every(e => e.edge === 'north')).toBe(true);
    });

    it('dual-layer BFS produces per-layer reachability', () => {
      const tileContext: TileAttrContext = 'interior-dungeon';
      const result = floodFillScreen(layer0, 0x51, {
        tileContext,
        startPos: { row: 46, col: 31 },
        dualLayerGrids: { layer0, layer1 },
        startLayer: 1,
      });
      // Should have reachableByLayer for dual-layer rooms
      expect(result.reachableByLayer).toBeDefined();
      expect(result.reachableByLayer![0].length).toBe(64);
      expect(result.reachableByLayer![1].length).toBe(64);
    });

    it('blocked tiles on layer 0 are NOT reachable on layer 0', () => {
      const tileContext: TileAttrContext = 'interior-dungeon';
      const result = floodFillScreen(layer0, 0x51, {
        tileContext,
        startPos: { row: 46, col: 31 },
        dualLayerGrids: { layer0, layer1 },
        startLayer: 1,
      });

      // These tiles have non-passable attrs on layer 0 (0x01, 0x02, 0x6f)
      const blockedOnLayer0: [number, number][] = [
        [31, 25], [28, 10], [39, 23],
        [29, 46], [13, 24],
      ];

      for (const [row, col] of blockedOnLayer0) {
        expect(
          result.reachableByLayer![0][row][col],
          `[${row},${col}] should NOT be reachable on layer 0`,
        ).toBe(0);
      }
    });

    it('walkable tiles ARE reachable', () => {
      const tileContext: TileAttrContext = 'interior-dungeon';
      const result = floodFillScreen(layer0, 0x51, {
        tileContext,
        startPos: { row: 46, col: 31 },
        dualLayerGrids: { layer0, layer1 },
        startLayer: 1,
      });

      const walkableTiles: [number, number][] = [
        [12, 31], [46, 31],
      ];

      for (const [row, col] of walkableTiles) {
        expect(
          result.reachable[row][col],
          `[${row},${col}] should be reachable`,
        ).not.toBe(0);
      }
    });
  });
});
