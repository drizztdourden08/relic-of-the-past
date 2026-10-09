/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as spritesStore from '../../storage/sprites-store';
import { activeRomFile } from '../active-rom-file';
import { setGearArtActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';
import { getModule } from '../wasm-bridge';
import { MEMFS_PATH } from './gear-icons.constants';

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

export { applyGearIcons };
