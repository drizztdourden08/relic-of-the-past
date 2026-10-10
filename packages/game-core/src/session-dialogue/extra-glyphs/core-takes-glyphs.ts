/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../../types';

const coreTakesGlyphs = (mod: EmscriptenModule): boolean =>
  typeof Reflect.get(mod, '_WasmLoadExtraGlyphs') === 'function';

export { coreTakesGlyphs };
