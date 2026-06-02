/**
 * Scan rooms to find ones where layer1 has BOTH 0x1C AND wall data.
 * These are the rooms where the wasm-bridge normalization matters most.
 */
import { describe, it, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';

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

describe('room scan — find rooms with mixed 0x1C + walls on layer1', () => {
  it('scans first 128 rooms', () => {
    const results: string[] = [];
    for (let roomId = 0; roomId < 128; roomId++) {
      let ptr: number;
      try {
        ptr = mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [roomId]) as number;
      } catch {
        continue;
      }
      if (!ptr) continue;

      let count0x1C = 0;
      let countWalls = 0; // non-zero, non-0x1C
      let count0x00 = 0;
      for (let r = 0; r < 64; r++) {
        for (let c = 0; c < 64; c++) {
          const v = mod.HEAPU8[ptr + 0x1000 + r * 64 + c];
          if (v === 0x1C) count0x1C++;
          else if (v === 0x00) count0x00++;
          else countWalls++;
        }
      }

      // We're interested in rooms that have BOTH 0x1C AND wall data
      if (count0x1C > 0 && countWalls > 0) {
        const val47_34 = mod.HEAPU8[ptr + 0x1000 + 34 * 64 + 47];
        results.push(
          `Room 0x${roomId.toString(16).padStart(2, '0')}: 0x1C=${count0x1C} walls=${countWalls} 0x00=${count0x00} | [47,34]=0x${val47_34.toString(16).padStart(2, '0')}`
        );
      }
    }

    console.log(`\nRooms with mixed 0x1C + walls on layer1 (${results.length} found):`);
    results.forEach(r => console.log(`  ${r}`));
  });

  it('checks room 0x51 layer1 detail at user coordinates', () => {
    const ptr = mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [0x51]) as number;
    const coords = [[47,34],[47,33],[47,32],[49,30]];
    console.log('\nRoom 0x51 layer1 at user coordinates:');
    for (const [col, row] of coords) {
      const a0 = mod.HEAPU8[ptr + row * 64 + col];
      const a1 = mod.HEAPU8[ptr + 0x1000 + row * 64 + col];
      console.log(`  [${col},${row}]: layer0=0x${a0.toString(16).padStart(2, '0')} layer1=0x${a1.toString(16).padStart(2, '0')}`);
    }
  });
});
