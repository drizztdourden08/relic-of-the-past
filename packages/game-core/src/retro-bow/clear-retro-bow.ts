/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';
import { setRetroBowActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings/reassert-gate-word-3';

const clearRetroBow = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearRetroBow', null, [], []);
  setRetroBowActive(false);
  reassertGateWord3();
};

export { clearRetroBow };
