/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as spritesStore from '../../storage/sprites-store';
import { activeRomFile } from '../active-rom-file';
import { getModule } from '@rotp/game-core';
import { CURRENCY_SYMBOLS_MEMFS_PATH } from '@rotp/game-core';

const applyCurrencySymbols = async (tag: string): Promise<boolean> => {
  const mod = getModule();
  if (!mod) return false;
  const romFile = await activeRomFile();
  const bytes = romFile === null ? null : await spritesStore.readCurrencySymbols(romFile);
  if (!bytes) {
    log.randomizer(`${tag} Price symbols: none extracted for ${romFile ?? '(no ROM)'}, prices stay bare`, 'warn');
    return false;
  }
  try {
    mod.FS.writeFile(CURRENCY_SYMBOLS_MEMFS_PATH, bytes);
    const ok = mod.ccall('WasmApplyCurrencySymbolsFile', 'number', ['string'], [CURRENCY_SYMBOLS_MEMFS_PATH]) !== 0;
    log.randomizer(`${tag} Price symbols: ${ok ? 'applied' : 'refused by the core'} (${bytes.length} B from ${romFile})`,
      ok ? 'info' : 'warn');
    return ok;
  } catch (err) {
    log.error(`${tag} Price symbols: apply failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

export { applyCurrencySymbols };
