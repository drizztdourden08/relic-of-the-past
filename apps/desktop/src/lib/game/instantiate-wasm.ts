/* @layer bridge-wasm @kind logic */
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
