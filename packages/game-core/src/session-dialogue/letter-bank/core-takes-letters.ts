/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../../types';

const coreTakesLetters = (mod: EmscriptenModule): boolean =>
  typeof Reflect.get(mod, '_WasmLoadLetterBank') === 'function';

export { coreTakesLetters };
