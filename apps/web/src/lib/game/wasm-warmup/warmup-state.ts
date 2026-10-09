/* @layer bridge-wasm @kind logic */
import type { WarmupState } from './wasm-warmup.type';

const warmupState: WarmupState = {
  compiledModule: null,
  cachedBytes: null,
  warmPromise: null,
  gluePromise: null,
};

export { warmupState };
