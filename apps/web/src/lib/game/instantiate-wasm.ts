/* @layer bridge-wasm @kind logic */
/**
 * WASM instantiation override that avoids WebAssembly.instantiateStreaming. That
 * path SEGFAULTs the Electron renderer (0xC0000005) while compiling this module,
 * black-screening the game the moment it starts — observed both over http:// (dev)
 * and file:// (the built app) on recent Chromium. We always use the non-streaming
 * WebAssembly.instantiate instead.
 *
 * The background warmup (wasm-warmup) usually has the module fetched AND compiled
 * already: when a cached compiled Module exists we instantiate straight from it
 * (skipping fetch + compile entirely). Otherwise we fall back to fetching the bytes
 * (also cached by warmup) and compiling here.
 */
import { log } from '../log-bus';
import { getCompiledModule, loadWasmBytes } from './wasm-warmup';

const createInstantiateWasm = () => (
  imports: WebAssembly.Imports,
  onSuccess: (instance: WebAssembly.Instance, mod: WebAssembly.Module) => void,
): Record<string, never> => {
  const onFail = (e: unknown) =>
    log.error(`WASM instantiate failed: ${e instanceof Error ? e.message : e}`);

  const cached = getCompiledModule();
  if (cached) {
    WebAssembly.instantiate(cached, imports)
      .then((instance) => onSuccess(instance, cached))
      .catch(onFail);
    return {};
  }

  loadWasmBytes()
    .then((buf) => WebAssembly.instantiate(buf, imports))
    .then((r) => onSuccess(r.instance, r.module))
    .catch(onFail);
  return {};
};

export { createInstantiateWasm };
