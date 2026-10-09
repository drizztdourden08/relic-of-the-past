/* @layer bridge-wasm @kind logic */
import { previewModuleNow } from '../../preview-core/preview-module-now';

const canPreviewOriginals = (): boolean => {
  const mod = previewModuleNow();
  if (mod === null) return false;
  try {
    return mod.ccall('WasmSoundPreviewReady', 'number', [], []) === 1;
  } catch {
    return false;
  }
};

export { canPreviewOriginals };
