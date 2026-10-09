/* @layer bridge-wasm @kind logic */
import { warmupState } from './warmup-state';

const getCompiledModule = (): WebAssembly.Module | null => warmupState.compiledModule;

export { getCompiledModule };
