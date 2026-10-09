/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';
import { hasCoreExport } from '../has-core-export';

const clearForeignIcons = (): void => {
  if (!hasCoreExport('WasmApplyForeignIconsFile')) return;
  getModule()?.ccall('WasmClearForeignIcons', null, [], []);
};

export { clearForeignIcons };
