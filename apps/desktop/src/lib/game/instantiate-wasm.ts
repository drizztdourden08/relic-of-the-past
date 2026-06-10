/* @layer bridge-wasm @kind logic */
/**
 * Dev-only WASM instantiation override. Under `npm run dev` the renderer is served
 * over http://localhost, and Electron's renderer SEGFAULTS (0xC0000005) inside
 * WebAssembly.instantiateStreaming while compiling this wasm — black-screening the
 * game. Fetching the bytes and using WebAssembly.instantiate (no streaming) avoids
 * the crashing path. The built app loads over file:// where (a) fetch() is blocked
 * and (b) emscripten's default streaming works fine, so we override ONLY under http(s)
 * and leave the default untouched everywhere else.
 */
import { log } from '../log-bus';

const createInstantiateWasm = () => {
  const isHttpRenderer = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  if (!isHttpRenderer) return undefined;
  return (
    imports: WebAssembly.Imports,
    onSuccess: (instance: WebAssembly.Instance, mod: WebAssembly.Module) => void,
  ): Record<string, never> => {
    const wasmUrl = new URL('./wasm/zelda3.wasm', window.location.href).href;
    fetch(wasmUrl)
      .then((r) => r.arrayBuffer())
      .then((buf) => WebAssembly.instantiate(buf, imports))
      .then((r) => onSuccess(r.instance, r.module))
      .catch((e) => log.error(`WASM instantiate failed: ${e instanceof Error ? e.message : e}`));
    return {};
  };
};

export { createInstantiateWasm };
