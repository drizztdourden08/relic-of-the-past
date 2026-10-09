/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../../types';
import { coreTakesGlyphs } from './core-takes-glyphs';
import { extraGlyphsState } from './extra-glyphs-state';

const clearExtraGlyphs = (mod: EmscriptenModule | null): void => {
  extraGlyphsState.loaded = [];
  if (mod && coreTakesGlyphs(mod)) mod.ccall('WasmClearExtraGlyphs', null, [], []);
};

export { clearExtraGlyphs };
