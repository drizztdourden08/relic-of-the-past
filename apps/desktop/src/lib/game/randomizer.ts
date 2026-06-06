/**
 * Randomizer — JS-side item override hooks that talk to the WASM core.
 */

import { log } from '../log-bus';
import { getModule } from './wasm-bridge';

const setItemOverride = (roomId: number, originalItem: number, newItem: number): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setItemOverride called with no active module');
    return;
  }
  mod.ccall('WasmSetItemOverride', null, ['number', 'number', 'number'], [roomId, originalItem, newItem]);
  log.app(`[Randomizer] Override set: room ${roomId}, 0x${originalItem.toString(16)} → 0x${newItem.toString(16)}`);
};

const clearItemOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearItemOverrides', null, [], []);
  log.app('[Randomizer] All overrides cleared');
};

export { clearItemOverrides, setItemOverride };
