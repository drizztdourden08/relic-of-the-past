/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';
import { hasCoreExport } from '@rotp/game-core';

const clearForeignIcons = (): void => {
  if (!hasCoreExport('WasmApplyForeignIconsFile')) return;
  getModule()?.ccall('WasmClearForeignIcons', null, [], []);
};

export { clearForeignIcons };
