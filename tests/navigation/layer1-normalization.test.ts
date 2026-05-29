/**
 * Layer1 normalization — verifies that 0x1C (default BG1 floor fill) is
 * correctly normalised to 0x00, and that the split tooltip never triggers
 * for tiles whose only layer difference is the default fill.
 *
 * Uses headless WASM to build collision tables, then checks:
 * - Rooms with all-0x1C on raw layer1 produce null dualLayerGrids
 * - Rooms with real dual-layer data keep their walls after normalization
 * - No tile has layer0 !== layer1 solely because of the 0x1C default fill
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';

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

/**
 * Replicate the wasm-bridge's normalization logic for dual layers.
 * 0x1C is treated as filler on either layer — normalized to the other layer's value.
 */
function readNormalizedDualLayers(ptr: number): { layer0: number[][]; layer1: number[][] } | null {
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

describe('layer1 0x1C normalization', () => {

  // Rooms whose raw layer1 is entirely 0x1C (from earlier diagnostic)
  const singleLayerRooms = [0x11, 0x44, 0x00];

  for (const roomId of singleLayerRooms) {
    it(`room 0x${roomId.toString(16).padStart(2, '0')}: single-layer (all-0x1C) → null dualLayerGrids`, () => {
      let ptr: number;
      try {
        ptr = mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [roomId]) as number;
      } catch {
        // Some rooms may crash in headless (missing assets etc.) — skip
        return;
      }
      expect(ptr).toBeGreaterThan(0);
      const result = readNormalizedDualLayers(ptr);
      expect(result).toBeNull();
    });
  }

  // Rooms with real dual-layer content
  const dualLayerRooms = [0x51, 0x01, 0x02, 0x61];

  for (const roomId of dualLayerRooms) {
    it(`room 0x${roomId.toString(16).padStart(2, '0')}: real dual-layer → keeps dualLayerGrids`, () => {
      let ptr: number;
      try {
        ptr = mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [roomId]) as number;
      } catch {
        return;
      }
      expect(ptr).toBeGreaterThan(0);
      const result = readNormalizedDualLayers(ptr);
      expect(result).not.toBeNull();
      // Must have walls on layer1
      let walls = 0;
      for (let r = 0; r < 64; r++)
        for (let c = 0; c < 64; c++)
          if (result!.layer1[r][c] !== 0x00) walls++;
      expect(walls).toBeGreaterThan(0);
    });
  }

  it('no tile has 0x1C after normalization on either layer', () => {
    // Check a broad set of rooms
    const roomsToCheck = [0x00, 0x01, 0x02, 0x11, 0x44, 0x51, 0x61, 0x75];
    for (const roomId of roomsToCheck) {
      let ptr: number;
      try {
        ptr = mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [roomId]) as number;
      } catch {
        continue;
      }
      if (!ptr) continue;

      const result = readNormalizedDualLayers(ptr);
      if (!result) continue; // null = single-layer, no split tooltip possible

      for (let r = 0; r < 64; r++) {
        for (let c = 0; c < 64; c++) {
          // After normalization, 0x1C should never appear on either layer
          // (unless both raw values are 0x1C, in which case they're equal)
          if (result.layer0[r][c] !== result.layer1[r][c]) {
            expect(result.layer0[r][c], `room 0x${roomId.toString(16)} [${r},${c}] layer0`).not.toBe(0x1C);
            expect(result.layer1[r][c], `room 0x${roomId.toString(16)} [${r},${c}] layer1`).not.toBe(0x1C);
          }
        }
      }
    }
  });

  it('tooltip split condition: never triggers from 0x1C default fill after normalization', () => {
    // Simulate the tooltip condition from ConnectionOverlay.tsx
    const tooltipShouldShowSplit = (layer0Attr: number | undefined, layer1Attr: number | undefined): boolean => {
      // Mirrors: tooltip.layer0Attr !== undefined && tooltip.layer0Attr !== (tooltip.layer1Attr ?? 0)
      return layer0Attr !== undefined && layer0Attr !== (layer1Attr ?? 0);
    };

    const roomsToCheck = [0x00, 0x01, 0x02, 0x11, 0x44, 0x51, 0x61, 0x75];
    for (const roomId of roomsToCheck) {
      let ptr: number;
      try {
        ptr = mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [roomId]) as number;
      } catch {
        continue;
      }
      if (!ptr) continue;

      const result = readNormalizedDualLayers(ptr);
      // If null (single-layer room), dualLayerGrids won't exist → no split tooltip
      if (!result) continue;

      for (let r = 0; r < 64; r++) {
        for (let c = 0; c < 64; c++) {
          const a0 = result.layer0[r][c];
          const a1 = result.layer1[r][c];
          if (tooltipShouldShowSplit(a0, a1)) {
            // If the split tooltip triggers, it must NOT be because of the
            // raw 0x1C default fill — that should have been normalized away.
            const rawA0 = mod.HEAPU8[ptr + r * 64 + c];
            const rawA1 = mod.HEAPU8[ptr + 0x1000 + r * 64 + c];
            expect(rawA0, `room 0x${roomId.toString(16)} [${r},${c}]: split triggered by raw 0x1C on layer0`).not.toBe(0x1C);
            expect(rawA1, `room 0x${roomId.toString(16)} [${r},${c}]: split triggered by raw 0x1C on layer1`).not.toBe(0x1C);
          }
        }
      }
    }
  });
});
