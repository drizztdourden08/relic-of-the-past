/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';
import { withDialogState } from '../state-dialog/with-dialog-state';
import { unlinkScratchFile } from './unlink-scratch-file';
import { SCRATCH_SLOT } from './state-buffers.constants';

const captureStateBuffer = (slot = SCRATCH_SLOT): ArrayBuffer | null => {
  const mod = getModule();
  if (!mod) return null;
  mod.ccall('WasmSaveState', null, ['number'], [slot]);
  const savePath = `/saves/save${slot}.sav`;
  if (!mod.FS.analyzePath(savePath).exists) return null;
  const data = mod.FS.readFile(savePath);
  const ab = withDialogState(mod, (data.buffer as ArrayBuffer).slice(data.byteOffset, data.byteOffset + data.byteLength));
  unlinkScratchFile(mod, savePath);
  return ab;
};

export { captureStateBuffer };
