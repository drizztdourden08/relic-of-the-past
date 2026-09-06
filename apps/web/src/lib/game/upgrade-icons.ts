/* @layer bridge-wasm @kind logic */
/**
 * The in-game capacity upgrade icons: the 512 B binary the sprite extraction emits
 * beside the PNGs (capacity-icons.4bpp, one 4bpp icon per family), handed to the core
 * when a randomizer session arms — written to MEMFS and applied with
 * WasmApplyUpgradeIconsFile, the player-sprite pattern. The core shows an icon over a
 * capacity upgrade's hold-up receipt under kFeatures3_CapacityProfile; a set extracted
 * before the binary existed, or no running module, leaves the refill art in place.
 */
import { log } from '../log-bus';
import * as spritesStore from '../storage/sprites-store';
import { activeRomFile } from './active-rom-file';
import { getModule } from './wasm-bridge';

const MEMFS_PATH = '/capacity-icons.4bpp';

/** Resolves true when the core took the icons of the active ROM's sprite set. */
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
    mod.FS.writeFile(MEMFS_PATH, bytes);
    const ok = mod.ccall('WasmApplyUpgradeIconsFile', 'number', ['string'], [MEMFS_PATH]) !== 0;
    log.randomizer(`${tag} Upgrade icons: ${ok ? 'applied' : 'refused by the core'} (${bytes.length} B from ${romFile})`,
      ok ? 'info' : 'warn');
    return ok;
  } catch (err) {
    log.error(`${tag} Upgrade icons: apply failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

const clearUpgradeIcons = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearUpgradeIcons', null, [], []);
};

export { applyUpgradeIcons, clearUpgradeIcons };
