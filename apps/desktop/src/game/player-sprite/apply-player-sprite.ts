/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';
import { isZspr, PLAYER_SPRITE_MEMFS_PATH } from '@rotp/packs';

const applyPlayerSprite = (bytes: Uint8Array): boolean => {
  const mod = getModule();
  if (!mod) return false;
  if (!isZspr(bytes)) {
    log.app('[PlayerSprite] Not a ZSPR sheet, refusing to apply');
    return false;
  }
  try {
    mod.FS.writeFile(PLAYER_SPRITE_MEMFS_PATH, bytes);
    const ok = mod.ccall('WasmApplyPlayerSpriteFile', 'number', ['string'], [PLAYER_SPRITE_MEMFS_PATH]);
    if (!ok) log.app('[PlayerSprite] Core rejected the sheet');
    return !!ok;
  } catch (err) {
    log.error(`[PlayerSprite] Live apply failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

export { applyPlayerSprite };
