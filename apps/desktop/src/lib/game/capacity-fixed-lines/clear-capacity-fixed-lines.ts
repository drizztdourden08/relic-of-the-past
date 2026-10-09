/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';

const clearCapacityFixedLines = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearCapacityFixedLines', null, [], []);
};

export { clearCapacityFixedLines };
