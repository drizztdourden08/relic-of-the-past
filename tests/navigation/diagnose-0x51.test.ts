/* @layer tests @kind test */
/**
 * Diagnostic: Run BFS on room 0x51 offline and check (45,30) reachability per layer.
 * Usage: npx vitest run temp-scripts/diagnose-0x51.ts
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';
import { floodFillScreen } from '../../shared/game/navigation/flood-fill/orchestrator';
import type { TileAttrContext } from '../../shared/game/navigation/tile-attrs';

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
let layer0: number[][];
let layer1: number[][];

const readGrid = (mod: WasmModule, ptr: number, offset: number): number[][] => {
  const grid: number[][] = Array.from({ length: 64 }, () => new Array(64));
  for (let r = 0; r < 64; r++) {
    for (let c = 0; c < 64; c++) {
      grid[r][c] = mod.HEAPU8[ptr + offset + r * 64 + c];
    }
  }
  return grid;
};

beforeAll(async () => {
  const nodeRequire = createRequire(import.meta.url);
  const Zelda3 = nodeRequire(join(WASM_DIR, 'zelda3.js'));
  const assetData = readFileSync(ASSETS_PATH);
  wasmModule = await Zelda3({
    noInitialRun: true,
    locateFile: (path: string) => join(WASM_DIR, path),
    preRun: [(m: WasmModule) => {
      m.FS.writeFile('/zelda3_assets.dat', new Uint8Array(assetData.buffer, assetData.byteOffset, assetData.byteLength));
      m.FS.mkdir('/saves');
    }],
    print: () => {},
    printErr: () => {},
  });
  wasmModule.ccall('WasmInitHeadless', 'number', [], []);
  const ptr = wasmModule.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [0x51]) as number;
  layer0 = readGrid(wasmModule, ptr, 0);
  layer1 = readGrid(wasmModule, ptr, 0x1000);
}, 30000);

describe('Room 0x51 layer reachability diagnostic', () => {
  it('diagnoses (45,30) reachability', () => {
    const tileContext: TileAttrContext = 'interior-dungeon';
    const result = floodFillScreen(layer0, 0x51, {
      tileContext,
      startPos: { row: 46, col: 31 },
      dualLayerGrids: { layer0, layer1 },
      startLayer: 1,
    });

    const TARGET_ROW = 45;
    const TARGET_COL = 30;

    console.log('\n=== RAW TILE ATTRS at (45,30) ===');
    console.log(`  layer0[45][30] = 0x${layer0[45][30].toString(16).padStart(2, '0')}`);
    console.log(`  layer1[45][30] = 0x${layer1[45][30].toString(16).padStart(2, '0')}`);
    console.log(`  layer0[45][31] = 0x${layer0[45][31].toString(16).padStart(2, '0')}`);
    console.log(`  layer1[45][31] = 0x${layer1[45][31].toString(16).padStart(2, '0')}`);
    console.log(`  layer0[46][30] = 0x${layer0[46][30].toString(16).padStart(2, '0')}`);
    console.log(`  layer1[46][30] = 0x${layer1[46][30].toString(16).padStart(2, '0')}`);
    console.log(`  layer0[46][31] = 0x${layer0[46][31].toString(16).padStart(2, '0')}`);
    console.log(`  layer1[46][31] = 0x${layer1[46][31].toString(16).padStart(2, '0')}`);

    console.log('\n=== BFS REACHABILITY at (45,30) ===');
    console.log(`  layer0 reached: ${result.reachableByLayer![0][TARGET_ROW][TARGET_COL]}`);
    console.log(`  layer1 reached: ${result.reachableByLayer![1][TARGET_ROW][TARGET_COL]}`);
    console.log(`  merged reached: ${result.reachable[TARGET_ROW][TARGET_COL]}`);

    // Print stair tiles in the area (SWAP_STAIR_ATTRS = 0x1E, 0x1F, 0x3E, 0x3F)
    const STAIR_ATTRS = new Set([0x1E, 0x1F, 0x3E, 0x3F]);
    const LEDGE_ATTRS = new Set([0x28, 0x29, 0x2A, 0x2B]);
    console.log('\n=== STAIR TILES in rows 40-55, cols 20-45 ===');
    for (let r = 40; r <= 55; r++) {
      for (let c = 20; c <= 45; c++) {
        if (STAIR_ATTRS.has(layer0[r][c])) {
          console.log(`  layer0[${r}][${c}] = 0x${layer0[r][c].toString(16)} (stair)`);
        }
        if (STAIR_ATTRS.has(layer1[r][c])) {
          console.log(`  layer1[${r}][${c}] = 0x${layer1[r][c].toString(16)} (stair)`);
        }
      }
    }

    console.log('\n=== LEDGE TILES (0x28-0x2B) in rows 30-55, cols 20-45 ===');
    for (let r = 30; r <= 55; r++) {
      for (let c = 20; c <= 45; c++) {
        if (LEDGE_ATTRS.has(layer0[r][c])) {
          console.log(`  layer0[${r}][${c}] = 0x${layer0[r][c].toString(16)} (ledge)`);
        }
        if (LEDGE_ATTRS.has(layer1[r][c])) {
          console.log(`  layer1[${r}][${c}] = 0x${layer1[r][c].toString(16)} (ledge)`);
        }
      }
    }

    // Dump RAW ATTRS for the transition zone rows 34-48
    console.log('\n=== RAW LAYER 0 ATTRS (rows 37-44, cols 18-45) ===');
    console.log('     ' + Array.from({ length: 28 }, (_, i) => (i + 18).toString().padStart(4)).join(''));
    for (let r = 37; r <= 44; r++) {
      let line = `r${r.toString().padStart(2)}: `;
      for (let c = 18; c <= 45; c++) {
        line += ` ${layer0[r][c].toString(16).padStart(3, ' ')}`;
      }
      console.log(line);
    }
    console.log('\n=== RAW LAYER 1 ATTRS (rows 37-44, cols 18-45) ===');
    console.log('     ' + Array.from({ length: 28 }, (_, i) => (i + 18).toString().padStart(4)).join(''));
    for (let r = 37; r <= 44; r++) {
      let line = `r${r.toString().padStart(2)}: `;
      for (let c = 18; c <= 45; c++) {
        line += ` ${layer1[r][c].toString(16).padStart(3, ' ')}`;
      }
      console.log(line);
    }

    // Print layer 0 reachability map for rows 40-55
    console.log('\n=== LAYER 0 REACHABILITY (rows 40-55, cols 20-45) ===');
    console.log('     ' + Array.from({ length: 26 }, (_, i) => (i + 20).toString().padStart(2)).join(' '));
    for (let r = 40; r <= 55; r++) {
      let line = `r${r.toString().padStart(2)}: `;
      for (let c = 20; c <= 45; c++) {
        const reached = result.reachableByLayer![0][r][c];
        const attr = layer0[r][c];
        if (reached) line += ' R';
        else if (STAIR_ATTRS.has(attr)) line += ' S';
        else if (attr === 0x00) line += ' .';
        else line += ' #';
      }
      console.log(line);
    }

    console.log('\n=== LAYER 1 REACHABILITY (rows 40-55, cols 20-45) ===');
    console.log('     ' + Array.from({ length: 26 }, (_, i) => (i + 20).toString().padStart(2)).join(' '));
    for (let r = 40; r <= 55; r++) {
      let line = `r${r.toString().padStart(2)}: `;
      for (let c = 20; c <= 45; c++) {
        const reached = result.reachableByLayer![1][r][c];
        const attr = layer1[r][c];
        if (reached) line += ' R';
        else if (STAIR_ATTRS.has(attr)) line += ' S';
        else if (attr === 0x00) line += ' .';
        else line += ' #';
      }
      console.log(line);
    }

    // Count total reachable per layer
    let l0count = 0, l1count = 0;
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        if (result.reachableByLayer![0][r][c]) l0count++;
        if (result.reachableByLayer![1][r][c]) l1count++;
      }
    }
    console.log(`\n=== TOTAL REACHABLE: layer0=${l0count}, layer1=${l1count} ===`);

    // Scan for entrance tiles (0x8E/0x8F) on both layers
    console.log('\n=== ENTRANCE TILES (0x8E/0x8F) ===');
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        if (layer0[r][c] === 0x8E || layer0[r][c] === 0x8F)
          console.log(`  layer0[${r}][${c}] = 0x${layer0[r][c].toString(16)}`);
        if (layer1[r][c] === 0x8E || layer1[r][c] === 0x8F)
          console.log(`  layer1[${r}][${c}] = 0x${layer1[r][c].toString(16)}`);
      }
    }

    // Scan for stair-labeled tiles (0x22, 0x34) — potential inter-room stairs
    console.log('\n=== INTER-ROOM STAIR TILES (0x22/0x34) ===');
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        if (layer0[r][c] === 0x22 || layer0[r][c] === 0x34)
          console.log(`  layer0[${r}][${c}] = 0x${layer0[r][c].toString(16)}`);
        if (layer1[r][c] === 0x22 || layer1[r][c] === 0x34)
          console.log(`  layer1[${r}][${c}] = 0x${layer1[r][c].toString(16)}`);
      }
    }

    // Scan for ALL tiles >= 0x30 that aren't common walls (looking for inter-room triggers)
    console.log('\n=== UNIQUE TILE ATTRS (both layers) ===');
    const attrCounts = new Map<number, number>();
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        attrCounts.set(layer0[r][c], (attrCounts.get(layer0[r][c]) ?? 0) + 1);
        attrCounts.set(layer1[r][c], (attrCounts.get(layer1[r][c]) ?? 0) + 1);
      }
    }
    const sorted = [...attrCounts.entries()].sort((a, b) => a[0] - b[0]);
    for (const [attr, count] of sorted) {
      console.log(`  0x${attr.toString(16).padStart(2, '0')}: ${count} tiles`);
    }

    // Look at rows 54-57 around col 30 (potential stair1 area)
    console.log('\n=== ATTRS near expected stair1 (rows 52-60, cols 28-36) ===');
    for (let r = 52; r <= 60; r++) {
      let line = `r${r.toString().padStart(2)}: `;
      for (let c = 28; c <= 36; c++) {
        line += ` L0=${layer0[r][c].toString(16).padStart(2,'0')} L1=${layer1[r][c].toString(16).padStart(2,'0')} |`;
      }
      console.log(line);
    }

    // Print entrances and transitions from BFS result
    console.log('\n=== ENTRANCES ===');
    for (const e of result.entrances) {
      console.log(`  id=${e.id} area=0x${e.area.toString(16)} gridRow=${e.gridRow} gridCol=${e.gridCol}`);
    }
    console.log('\n=== TRANSITIONS (entrance type) ===');
    for (const t of result.transitions.filter(t => t.edge === 'entrance')) {
      console.log(`  entranceIdx=${t.entranceIdx} row=${t.row} col=${t.col} reqs=[${t.requirements}]`);
    }

    // The assertion: (45,30) should NOT be reachable on layer 0
    expect(result.reachableByLayer![0][TARGET_ROW][TARGET_COL], '(45,30) should NOT be reachable on layer 0').toBe(0);
  });
});
