/**
 * Headless WASM Grid Provider — loads the zelda3 WASM module in Node.js
 * without SDL/rendering, purely for navigation grid building.
 *
 * Usage:
 *   const provider = await HeadlessWasmGridProvider.create('path/to/zelda3_assets.dat');
 *   const grid = provider.getOverworldRawAttr(0x00);
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import type { GridProvider } from './grid-provider';

interface HeadlessModule {
  ccall: (name: string, returnType: string, argTypes: string[], args: unknown[]) => unknown;
  HEAPU8: Uint8Array;
  FS: {
    mkdir: (path: string) => void;
    writeFile: (path: string, data: Uint8Array) => void;
  };
}

export class HeadlessWasmGridProvider implements GridProvider {
  private constructor(private mod: HeadlessModule) {}

  /**
   * Create a headless provider by loading the WASM module and asset file.
   * @param assetsPath  Path to zelda3_assets.dat
   * @param wasmDir     Directory containing zelda3.js + zelda3.wasm (defaults to apps/desktop/public/wasm/)
   */
  static async create(assetsPath: string, wasmDir?: string): Promise<HeadlessWasmGridProvider> {
    const resolvedWasmDir = wasmDir ?? resolve(__dirname, '../../../../apps/desktop/public/wasm');
    const wasmJsPath = resolve(resolvedWasmDir, 'zelda3.js');

    // Load the Emscripten module factory
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Zelda3Factory = require(wasmJsPath);

    // Read the assets file
    const assetsData = readFileSync(assetsPath);

    // Instantiate without calling main()
    const mod: HeadlessModule = await Zelda3Factory({
      noInitialRun: true,
      locateFile: (file: string) => resolve(resolvedWasmDir, file),
      preRun: [(m: HeadlessModule) => {
        // Write assets file into Emscripten virtual FS before init
        try { m.FS.mkdir('/assets'); } catch { /* exists */ }
        m.FS.writeFile('/assets/zelda3_assets.dat', new Uint8Array(assetsData));
      }],
      // Suppress SDL errors in Node.js
      print: () => {},
      printErr: () => {},
    });

    // Initialize game core (loads assets, sets up memory)
    const result = mod.ccall('WasmInitHeadless', 'number', [], []);
    if (!result) {
      throw new Error('WasmInitHeadless failed — check that zelda3_assets.dat is valid');
    }

    return new HeadlessWasmGridProvider(mod);
  }

  getOverworldRawAttr(screenIndex: number): Uint8Array {
    const ptr = this.mod.ccall('WasmBuildOverworldAttrGrid', 'number', ['number'], [screenIndex]) as number;
    if (!ptr) throw new Error(`Failed to build overworld grid for screen ${screenIndex}`);
    return new Uint8Array(this.mod.HEAPU8.buffer, ptr, 64 * 64).slice();
  }

  getRoomRawAttr(roomId: number): Uint8Array {
    const ptr = this.mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [roomId]) as number;
    if (!ptr) throw new Error(`Failed to build room grid for room ${roomId}`);
    return new Uint8Array(this.mod.HEAPU8.buffer, ptr, 64 * 64).slice();
  }
}
