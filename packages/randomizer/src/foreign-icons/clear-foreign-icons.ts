/* @layer bridge-wasm @kind logic */
import { getModule, hasCoreExport } from '@rotp/game-core';

const clearForeignIcons = (): void => {
  if (!hasCoreExport('WasmApplyForeignIconsFile')) return;
  getModule()?.ccall('WasmClearForeignIcons', null, [], []);
};

export { clearForeignIcons };
