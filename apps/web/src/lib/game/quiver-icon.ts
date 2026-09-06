/* @layer bridge-wasm @kind logic */
/**
 * The quiver's in-game picture: the 128 B binary the sprite extraction emits beside the
 * PNGs (quiver-icon.4bpp, the drawing reduced to one sprite palette row), handed to the
 * core when a randomizer session arms, written to MEMFS and applied with
 * WasmApplyQuiverIconFile, the gear-pictures pattern. The core draws it for the
 * single-arrow receipt a retro seed hands the quiver over as, on the shelf and in the
 * hold-up, under the retro bow's own gate (kFeatures3_RetroBow, armed by retro-bow.ts);
 * no gate of its own is flipped here. A set extracted before the binary existed, or no
 * running module, leaves the arrow in place.
 */
import { log } from '../log-bus';
import * as spritesStore from '../storage/sprites-store';
import { activeRomFile } from './active-rom-file';
import { getModule } from './wasm-bridge';

const MEMFS_PATH = '/quiver-icon.4bpp';

/** Resolves true when the core took the quiver picture of the active ROM's sprite set. */
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

const clearQuiverIcon = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearQuiverIcon', null, [], []);
};

export { applyQuiverIcon, clearQuiverIcon };
