/* @layer bridge-wasm @kind logic */
/**
 * The multiworld pool icons in the game itself: the binary the sprite extraction emits beside
 * the PNGs (foreign-icons.4bpp, one 4bpp picture per pool icon, then the icons' own palette,
 * which the core keeps in a private bank only the icons read), handed to the core when an
 * online session arms its scouted placement, written to MEMFS and applied with
 * WasmApplyForeignIconsFile, the upgrade-icons pattern. The core holds another player's item
 * up with the icon of that player's game under kFeatures5_ApOnline; a set extracted before the
 * binary existed, or a core without the export, leaves the plain sentinel and its jar in place.
 */
import { log } from '../log-bus';
import * as spritesStore from '../storage/sprites-store';
import { activeRomFile } from './active-rom-file';
import { getModule } from './wasm-bridge';

const MEMFS_PATH = '/foreign-icons.4bpp';

const coreTakesIcons = (): boolean => {
  const mod = getModule() as unknown as Record<string, unknown> | null;
  return mod !== null && typeof mod._WasmApplyForeignIconsFile === 'function';
};

/** Resolves true when the core took the pool icons of the active ROM's sprite set. */
const applyForeignIcons = async (tag: string): Promise<boolean> => {
  const mod = getModule();
  if (!mod || !coreTakesIcons()) return false;
  const romFile = await activeRomFile();
  const bytes = romFile === null ? null : await spritesStore.readForeignIcons(romFile);
  if (!bytes) {
    log.randomizer(`${tag} Foreign icons: none extracted for ${romFile ?? '(no ROM)'}, the plain hold-up stays`, 'warn');
    return false;
  }
  try {
    mod.FS.writeFile(MEMFS_PATH, bytes);
    const ok = mod.ccall('WasmApplyForeignIconsFile', 'number', ['string'], [MEMFS_PATH]) !== 0;
    log.randomizer(`${tag} Foreign icons: ${ok ? 'applied' : 'refused by the core'} (${bytes.length} B from ${romFile})`,
      ok ? 'info' : 'warn');
    return ok;
  } catch (err) {
    log.error(`${tag} Foreign icons: apply failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

const clearForeignIcons = (): void => {
  if (!coreTakesIcons()) return;
  getModule()?.ccall('WasmClearForeignIcons', null, [], []);
};

export { applyForeignIcons, clearForeignIcons };
