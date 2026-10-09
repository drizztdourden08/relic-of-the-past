/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as spritesStore from '../../storage/sprites-store';
import { activeRomFile } from '../active-rom-file';
import { getModule } from '../wasm-bridge';
import { UPGRADE_ICONS_MEMFS_PATH } from './upgrade-icons.constants';

const applyUpgradeIcons = async (tag: string): Promise<boolean> => {
  const mod = getModule();
  if (!mod) return false;
  const romFile = await activeRomFile();
  const bytes = romFile === null ? null : await spritesStore.readCapacityIcons(romFile);
  if (!bytes) {
    log.randomizer(`${tag} Upgrade icons: none extracted for ${romFile ?? '(no ROM)'}, refill art stays`, 'warn');
    return false;
  }
  try {
    mod.FS.writeFile(UPGRADE_ICONS_MEMFS_PATH, bytes);
    const ok = mod.ccall('WasmApplyUpgradeIconsFile', 'number', ['string'], [UPGRADE_ICONS_MEMFS_PATH]) !== 0;
    log.randomizer(`${tag} Upgrade icons: ${ok ? 'applied' : 'refused by the core'} (${bytes.length} B from ${romFile})`,
      ok ? 'info' : 'warn');
    return ok;
  } catch (err) {
    log.error(`${tag} Upgrade icons: apply failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

export { applyUpgradeIcons };
