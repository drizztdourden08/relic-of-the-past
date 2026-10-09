/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as spritesStore from '../../storage/sprites-store';
import { activeRomFile } from '../active-rom-file';
import { getModule } from '../wasm-bridge';
import { MEMFS_PATH } from './quiver-icon.constants';

const applyQuiverIcon = async (tag: string): Promise<boolean> => {
  const mod = getModule();
  if (!mod) return false;
  const romFile = await activeRomFile();
  const bytes = romFile === null ? null : await spritesStore.readQuiverIcon(romFile);
  if (!bytes) {
    log.randomizer(`${tag} Quiver art: none extracted for ${romFile ?? '(no ROM)'}, the arrow stays`, 'warn');
    return false;
  }
  try {
    mod.FS.writeFile(MEMFS_PATH, bytes);
    const ok = mod.ccall('WasmApplyQuiverIconFile', 'number', ['string'], [MEMFS_PATH]) !== 0;
    log.randomizer(`${tag} Quiver art: ${ok ? 'applied' : 'refused by the core'} (${bytes.length} B from ${romFile})`,
      ok ? 'info' : 'warn');
    return ok;
  } catch (err) {
    log.error(`${tag} Quiver art: apply failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

export { applyQuiverIcon };
