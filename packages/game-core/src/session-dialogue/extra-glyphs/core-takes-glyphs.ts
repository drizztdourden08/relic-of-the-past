/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../../types';

const coreTakesGlyphs = (mod: EmscriptenModule): boolean =>
  typeof (mod as unknown as Record<string, unknown>)._WasmLoadExtraGlyphs === 'function';

export { coreTakesGlyphs };
