/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../types';

const unlinkScratchFile = (mod: EmscriptenModule, path: string): void => {
  try {
    mod.FS.unlink(path);
  } catch {
    return;
  }
};

export { unlinkScratchFile };
