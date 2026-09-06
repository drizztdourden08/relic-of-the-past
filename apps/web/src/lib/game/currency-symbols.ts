/* @layer bridge-wasm @kind logic */
/**
 * The shop price symbols: the 576 B binary the sprite extraction emits beside the PNGs
 * (currency-symbols.4bpp, one 16x8 strip per currency a shelf may charge, reduced to
 * one sprite palette row), handed to the core when a randomizer session arms, written
 * to MEMFS and applied with WasmApplyCurrencySymbolsFile, the quiver-picture pattern.
 * The core draws the strip beside a randomized shelf's price under the shop override
 * gate (kFeatures3_ShopOverrides, armed by the session); no gate of its own is flipped
 * here. A set extracted before the binary existed, or no running module, leaves the
 * price as bare digits.
 */
import { log } from '../log-bus';
import * as spritesStore from '../storage/sprites-store';
import { activeRomFile } from './active-rom-file';
import { getModule } from './wasm-bridge';

const MEMFS_PATH = '/currency-symbols.4bpp';

/** Resolves true when the core took the price symbols of the active ROM's sprite set. */
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
    mod.FS.writeFile(MEMFS_PATH, bytes);
    const ok = mod.ccall('WasmApplyCurrencySymbolsFile', 'number', ['string'], [MEMFS_PATH]) !== 0;
    log.randomizer(`${tag} Price symbols: ${ok ? 'applied' : 'refused by the core'} (${bytes.length} B from ${romFile})`,
      ok ? 'info' : 'warn');
    return ok;
  } catch (err) {
    log.error(`${tag} Price symbols: apply failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

const clearCurrencySymbols = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearCurrencySymbols', null, [], []);
};

export { applyCurrencySymbols, clearCurrencySymbols };
