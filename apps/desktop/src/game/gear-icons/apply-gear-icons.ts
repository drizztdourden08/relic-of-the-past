/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as spritesStore from '../../storage/sprites-store';
import { activeRomFile } from '../active-rom-file';
import { setGearArtActive, getModule, GEAR_ICONS_MEMFS_PATH } from '@rotp/game-core';
import { reassertGateWord3 } from '../live-settings';

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
    mod.FS.writeFile(GEAR_ICONS_MEMFS_PATH, bytes);
    const ok = mod.ccall('WasmApplyGearIconsFile', 'number', ['string'], [GEAR_ICONS_MEMFS_PATH]) !== 0;
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

export { applyGearIcons };
