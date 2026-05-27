import type { GridProvider } from './grid-provider';
import type { RomData } from '../../../asset-extraction/rom/rom-types';
import { loadMap32Tables, loadMap16ToMap8, loadMap8ToAttr, decompressScreen } from '../screen-data';
import type { Map32Tables } from '../types';

/**
 * GridProvider backed by ROM decompression (existing TS implementation).
 * Used by offline scripts and as a fallback when WASM is unavailable.
 * 
 * Produces the same output as WasmGridProvider — both follow the
 * tile_detect.c collision attribute pipeline.
 */
export class RomGridProvider implements GridProvider {
  private map32: Map32Tables;
  private map16ToMap8: Uint16Array;
  private map8ToAttr: Uint8Array;

  constructor(private rom: RomData) {
    this.map32 = loadMap32Tables(rom);
    this.map16ToMap8 = loadMap16ToMap8(rom);
    this.map8ToAttr = loadMap8ToAttr(rom);
  }

  getOverworldRawAttr(screenIndex: number): Uint8Array {
    const map16 = decompressScreen(this.rom, screenIndex, this.map32);
    const grid = new Uint8Array(64 * 64);

    for (let row = 0; row < 64; row++) {
      for (let col = 0; col < 64; col++) {
        const map16Row = row >> 1;
        const map16Col = col >> 1;
        const subIdx = (row & 1) * 2 + (col & 1);
        const map16Id = map16[map16Row * 32 + map16Col];
        const map8Entry = this.map16ToMap8[map16Id * 4 + subIdx];
        let attr = this.map8ToAttr[map8Entry & 0x1ff];
        // Priority bit for deep grass/water
        if (attr >= 0x10 && attr < 0x1C) {
          attr |= (map8Entry >> 14) & 1;
        }
        grid[row * 64 + col] = attr;
      }
    }

    return grid;
  }

  getRoomRawAttr(_roomId: number): Uint8Array {
    // Indoor rooms require running Dungeon_LoadRoom() which is only available in WASM.
    // For offline use, callers should use rawAttrOverride or WasmGridProvider.
    throw new Error('RomGridProvider does not support indoor rooms — use WasmGridProvider or rawAttrOverride');
  }
}
