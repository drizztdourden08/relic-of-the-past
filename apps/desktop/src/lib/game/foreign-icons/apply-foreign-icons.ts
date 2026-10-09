/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as spritesStore from '../../storage/sprites-store';
import { activeRomFile } from '../active-rom-file';
import { getModule } from '../wasm-bridge';
import { hasCoreExport } from '../has-core-export';
import { FOREIGN_ICONS_MEMFS_PATH } from './foreign-icons.constants';

const applyForeignIcons = async (tag: string): Promise<boolean> => {
  const mod = getModule();
  if (!mod || !hasCoreExport('WasmApplyForeignIconsFile')) return false;
  const romFile = await activeRomFile();
  const bytes = romFile === null ? null : await spritesStore.readForeignIcons(romFile);
  if (!bytes) {
    log.randomizer(`${tag} Foreign icons: none extracted for ${romFile ?? '(no ROM)'}, the plain hold-up stays`, 'warn');
    return false;
  }
  try {
    mod.FS.writeFile(FOREIGN_ICONS_MEMFS_PATH, bytes);
    const ok = mod.ccall('WasmApplyForeignIconsFile', 'number', ['string'], [FOREIGN_ICONS_MEMFS_PATH]) !== 0;
    log.randomizer(`${tag} Foreign icons: ${ok ? 'applied' : 'refused by the core'} (${bytes.length} B from ${romFile})`,
      ok ? 'info' : 'warn');
    return ok;
  } catch (err) {
    log.error(`${tag} Foreign icons: apply failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

export { applyForeignIcons };
