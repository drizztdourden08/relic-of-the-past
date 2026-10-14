/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '@rotp/game-core';

const isGameModule = (value: unknown): value is EmscriptenModule =>
  typeof value === 'object' && value !== null && 'FS' in value && 'HEAPU8' in value
  && typeof Reflect.get(value, 'ccall') === 'function';

export { isGameModule };
