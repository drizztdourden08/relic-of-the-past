/* @layer bridge-wasm @kind logic */
/**
 * Live player-sprite swapping. The boot path stages a .zspr through the INI (see boot-files), but a
 * sheet can also be swapped while the game runs: write it to the same MEMFS path and let the core
 * re-read it, which overwrites the gfx + palette assets and pushes the new palette straight to CGRAM.
 * Returns false when no game is running, so callers can fall back to "applies on next boot".
 */
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { isZspr } from './zspr';

const MEMFS_PATH = '/link_sprite.zspr';

/** Swap the running game's player sheet. False if there's no module or the bytes aren't a ZSPR. */
const applyPlayerSprite = (bytes: Uint8Array): boolean => {
  const mod = getModule();
  if (!mod) return false;
  if (!isZspr(bytes)) {
    log.app('[PlayerSprite] Refusing to apply — not a ZSPR sheet');
    return false;
  }
  try {
    mod.FS.writeFile(MEMFS_PATH, bytes);
    const ok = mod.ccall('WasmApplyPlayerSpriteFile', 'number', ['string'], [MEMFS_PATH]);
    if (!ok) log.app('[PlayerSprite] Core rejected the sheet');
    return !!ok;
  } catch (err) {
    log.error(`[PlayerSprite] Live apply failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

/** Put the stock sheet back in the running game. False if there's no module. */
const clearPlayerSprite = (): boolean => {
  const mod = getModule();
  if (!mod) return false;
  try {
    mod.ccall('WasmClearPlayerSprite', null, [], []);
    return true;
  } catch (err) {
    log.error(`[PlayerSprite] Live restore failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

export { applyPlayerSprite, clearPlayerSprite };
