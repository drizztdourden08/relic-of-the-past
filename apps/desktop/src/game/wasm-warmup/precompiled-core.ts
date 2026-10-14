/* @layer bridge-wasm @kind logic */
import { getCompiledModule } from '@rotp/game-core';
import { loadWasmBytes } from './load-wasm-bytes';

const precompiledCore = async (): Promise<WebAssembly.Module> =>
  getCompiledModule() ?? WebAssembly.compile(await loadWasmBytes());

export { precompiledCore };
