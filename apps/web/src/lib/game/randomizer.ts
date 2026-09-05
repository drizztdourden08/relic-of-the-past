/* @layer bridge-wasm @kind logic */
/**
 * JS-side item override hooks that talk to the WASM core.
 */

import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setItemOverridesActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';

const setItemOverride = (roomId: number, originalItem: number, newItem: number): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setItemOverride called with no active module');
    return;
  }
  // Arm kFeatures3_ItemOverrides before writing the table, because WasmSetItemOverride itself is gated
  // on this bit (item_overrides.c), and the gate stays open only while the table has entries (see
  // the note on itemOverridesActive in live-settings-flags.ts), so no leftover table can silently
  // reapply outside an active randomizer session.
  setItemOverridesActive(true);
  reassertGateWord3();
  mod.ccall('WasmSetItemOverride', null, ['number', 'number', 'number'], [roomId, originalItem, newItem]);
  log.app(`[Randomizer] Override set: room ${roomId}, 0x${originalItem.toString(16)} → 0x${newItem.toString(16)}`);
};

const clearItemOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Clear the table while the gate is still open (WasmClearItemOverrides is gated the same way),
  // then close it. The table is empty either way, but closing the gate keeps it from reopening
  // for stale data if something else re-populates it without going through setItemOverride.
  mod.ccall('WasmClearItemOverrides', null, [], []);
  setItemOverridesActive(false);
  reassertGateWord3();
  log.app('[Randomizer] All overrides cleared');
};

export { clearItemOverrides, setItemOverride };
