/* @layer bridge-wasm @kind logic */
import { bridgeState } from './bridge-state';

const setInput = (mask: number): void => {
  const mod = bridgeState.currentModule;
  if (!mod || bridgeState.currentState.status !== 'running') return;
  mod.ccall('WasmSetInput', null, ['number'], [mask]);
};

export { setInput };
