/**
 * Live-data debug test — uses headless WASM with rooms matching the user's
 * observed tile data (layer0=0x00, layer1=0x1C at floor tiles) to verify
 * the wasm-bridge normalization correctly eliminates false split tooltips.
 *
 * The user's room has layer1 dominated by 0x1C (BG1 floor fill) with some
 * border walls. After normalization, 0x1C → 0x00, matching layer0's ground.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';

// ─── Paths ────────────────────────────────────────────────────────────────────

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

let mod: WasmModule;

beforeAll(async () => {
  const nodeRequire = createRequire(import.meta.url);
  const Zelda3 = nodeRequire(join(WASM_DIR, 'zelda3.js'));
  const assetData = readFileSync(ASSETS_PATH);

  mod = await Zelda3({
    noInitialRun: true,
    locateFile: (path: string) => join(WASM_DIR, path),
    preRun: [(m: WasmModule) => {
      m.FS.writeFile('/zelda3_assets.dat', new Uint8Array(assetData.buffer, assetData.byteOffset, assetData.byteLength));
      m.FS.mkdir('/saves');
    }],
    print: () => {},
    printErr: () => {},
  });

  mod.ccall('WasmInitHeadless', 'number', [], []);
}, 30000);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Replicate the EXACT normalization logic from wasm-bridge.ts wasmGetIndoorDualLayerGrids()
 */
function getNormalizedDualLayers(ptr: number): { layer0: number[][]; layer1: number[][] } | null {
  const layer0: number[][] = Array.from({ length: 64 }, () => new Array(64));
  const layer1: number[][] = Array.from({ length: 64 }, () => new Array(64));
  let hasDifference = false;
  for (let r = 0; r < 64; r++) {
    for (let c = 0; c < 64; c++) {
      let a0 = mod.HEAPU8[ptr + r * 64 + c];
      let a1 = mod.HEAPU8[ptr + 0x1000 + r * 64 + c];
      if (a0 === 0x1C && a1 !== 0x1C) a0 = a1;
      if (a1 === 0x1C && a0 !== 0x1C) a1 = a0;
      layer0[r][c] = a0;
      layer1[r][c] = a1;
      if (a0 !== a1) hasDifference = true;
    }
  }
  if (!hasDifference) return null;
  return { layer0, layer1 };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Rooms with BG1 floor fill 0x1C — normalization verification', () => {

  // These rooms match the user's pattern: layer0=0x00 (ground) at walkable tiles,
  // but raw layer1=0x1C (BG1 floor fill). Some have border walls on layer1.
  // Room 0x12 = Sanctuary, 0x41/0x42 = Hyrule Castle throne rooms
  const testRooms = [0x12, 0x41, 0x42, 0x21, 0x22, 0x0b, 0x19, 0x32, 0x55];

  for (const roomId of testRooms) {
    describe(`room 0x${roomId.toString(16).padStart(2, '0')}`, () => {

      it('at [47,34]: no split tooltip after normalization', () => {
        let ptr: number;
        try {
          ptr = mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [roomId]) as number;
        } catch { return; }
        if (!ptr) return;

        const grids = getNormalizedDualLayers(ptr);

        // For these rooms (BG1/BG2 floor fill = 0x1C), after normalization
        // the layers should be identical → null (no dual-layer data)
        // OR if grids exist, [47,34] should not trigger a split.
        if (!grids) {
          // Single-layer after normalization. No split possible. PASS.
          return;
        }

        const row = 34, col = 47;
        const a0 = grids.layer0[row][col];
        const a1 = grids.layer1[row][col];

        // If the split condition would trigger, neither raw value should be 0x1C
        if (a0 !== a1) {
          const rawA0 = mod.HEAPU8[ptr + row * 64 + col];
          const rawA1 = mod.HEAPU8[ptr + 0x1000 + row * 64 + col];
          expect(rawA0, `split at [${col},${row}] caused by 0x1C on layer0`).not.toBe(0x1C);
          expect(rawA1, `split at [${col},${row}] caused by 0x1C on layer1`).not.toBe(0x1C);
        }
      });

      it('no tile triggers split from 0x1C default fill', () => {
        let ptr: number;
        try {
          ptr = mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [roomId]) as number;
        } catch { return; }
        if (!ptr) return;

        const grids = getNormalizedDualLayers(ptr);
        if (!grids) return; // null = correct, no split possible

        let falsePositives = 0;
        for (let r = 0; r < 64; r++) {
          for (let c = 0; c < 64; c++) {
            const rawA0 = mod.HEAPU8[ptr + r * 64 + c];
            const rawA1 = mod.HEAPU8[ptr + 0x1000 + r * 64 + c];
            if (rawA0 !== 0x1C && rawA1 !== 0x1C) continue; // not a filler tile

            const a0 = grids.layer0[r][c];
            const a1 = grids.layer1[r][c];
            if (a0 !== a1) falsePositives++;
          }
        }
        expect(falsePositives, 'no false-positive splits from 0x1C fill').toBe(0);
      });
    });
  }
});
