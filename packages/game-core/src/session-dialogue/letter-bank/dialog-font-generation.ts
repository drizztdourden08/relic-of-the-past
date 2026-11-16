/* @layer bridge-wasm @kind logic */
import { hasCoreExport } from '../../has-core-export';
import { numberCall } from '../../bridge/wasm-call';

const dialogFontGeneration = (): number =>
  hasCoreExport('WasmDialogFontGeneration') ? numberCall('WasmDialogFontGeneration', 0) : 0;

export { dialogFontGeneration };
