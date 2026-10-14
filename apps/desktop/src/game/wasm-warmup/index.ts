/* @layer bridge-wasm @kind barrel */
export { getCompiledModule, loadGlueScript } from '@rotp/game-core';
export { loadWasmBytes } from './load-wasm-bytes';
export { precompiledCore } from './precompiled-core';
export { warmWasmCore } from './warm-wasm-core';
export type { WarmReport } from '@rotp/game-core';
