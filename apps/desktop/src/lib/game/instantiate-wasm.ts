/* @layer bridge-wasm @kind logic */
/**
 * WASM instantiation override that avoids WebAssembly.instantiateStreaming. That
 * path SEGFAULTs the Electron renderer (0xC0000005) while compiling this module,
 * black-screening the game the moment it starts — observed both over http:// (dev)
 * and file:// (the built app) on recent Chromium. We always fetch the bytes and use
 * the non-streaming WebAssembly.instantiate instead. Over http(s) the bytes come
 * from fetch(); over file:// (where fetch is blocked) they come from the main
 * process via IPC.
 */
import { log } from '../log-bus';

const loadWasmBytes = (): Promise<ArrayBuffer> => {
  const isHttpRenderer = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  if (isHttpRenderer) {
    const wasmUrl = new URL('./wasm/zelda3.wasm', window.location.href).href;
    return fetch(wasmUrl).then((r) => r.arrayBuffer());
  }
  return window.api.readWasmBytes();
};

const createInstantiateWasm = () => (
  imports: WebAssembly.Imports,
  onSuccess: (instance: WebAssembly.Instance, mod: WebAssembly.Module) => void,
): Record<string, never> => {
  loadWasmBytes()
    .then((buf) => WebAssembly.instantiate(buf, imports))
    .then((r) => onSuccess(r.instance, r.module))
    .catch((e) => log.error(`WASM instantiate failed: ${e instanceof Error ? e.message : e}`));
  return {};
};

export { createInstantiateWasm };
