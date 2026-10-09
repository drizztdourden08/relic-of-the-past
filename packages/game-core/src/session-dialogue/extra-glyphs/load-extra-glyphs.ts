/* @layer bridge-wasm @kind logic */
import type { ExtraGlyphSlot } from '@rotp/game-data';
import type { EmscriptenModule } from '../../types';
import { coreTakesGlyphs } from './core-takes-glyphs';
import { extraGlyphsState } from './extra-glyphs-state';
import { tableOf } from './table-of';

const loadExtraGlyphs = (mod: EmscriptenModule, extras: readonly ExtraGlyphSlot[]): boolean => {
  if (extras.length === 0 || !coreTakesGlyphs(mod)) {
    extraGlyphsState.loaded = [];
    return false;
  }
  const ptr = mod.ccall('WasmExtraGlyphTable', 'number', [], []);
  mod.HEAPU8.set(tableOf(extras), ptr);
  const taken = mod.ccall('WasmLoadExtraGlyphs', 'number', ['number', 'number'], [ptr, extras.length]);
  extraGlyphsState.loaded = taken === extras.length ? extras : [];
  return extraGlyphsState.loaded.length > 0;
};

export { loadExtraGlyphs };
