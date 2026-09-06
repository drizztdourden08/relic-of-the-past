/* @layer bridge-wasm @kind logic */
/**
 * The in-game gear pictures: the 1024 B binary the sprite extraction emits beside the
 * PNGs (gear-icons.4bpp, one 4bpp picture per affected receipt id), handed to the core
 * when a randomizer session arms — written to MEMFS and applied with
 * WasmApplyGearIconsFile, the upgrade-icons pattern. The core draws those tiles for a
 * substituted world blade or shield under kFeatures3_GearArt, so a shelf shows the item
 * it is selling instead of the gear the player happens to carry; a set extracted before
 * the binary existed, or no running module, leaves the vanilla art in place.
 */
import { log } from '../log-bus';
import * as spritesStore from '../storage/sprites-store';
import { activeRomFile } from './active-rom-file';
import { setGearArtActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';
import { getModule } from './wasm-bridge';

const MEMFS_PATH = '/gear-icons.4bpp';

/** Resolves true when the core took the gear pictures of the active ROM's sprite set. */
const applyGearIcons = async (tag: string): Promise<boolean> => {
  const mod = getModule();
  if (!mod) return false;
  const romFile = await activeRomFile();
  const bytes = romFile === null ? null : await spritesStore.readGearIcons(romFile);
  if (!bytes) {
    log.randomizer(`${tag} Gear art: none extracted for ${romFile ?? '(no ROM)'}, vanilla art stays`, 'warn');
    return false;
  }
  try {
    mod.FS.writeFile(MEMFS_PATH, bytes);
    const ok = mod.ccall('WasmApplyGearIconsFile', 'number', ['string'], [MEMFS_PATH]) !== 0;
    if (ok) {
      setGearArtActive(true);
      reassertGateWord3();
    }
    log.randomizer(`${tag} Gear art: ${ok ? 'applied' : 'refused by the core'} (${bytes.length} B from ${romFile})`,
      ok ? 'info' : 'warn');
    return ok;
  } catch (err) {
    log.error(`${tag} Gear art: apply failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

const clearGearIcons = (): void => {
  setGearArtActive(false);
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearGearIcons', null, [], []);
  reassertGateWord3();
};

export { applyGearIcons, clearGearIcons };
