/* @layer bridge-wasm @kind logic */
/**
 * Randomizer: JS-side item override hooks that talk to the WASM core.
 */

import { isGrantableReceiveId } from '@shared/game/data';
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setItemOverridesActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';

// |messageId| is the pre-rendered contextual receipt line for this grant (session
// dialogue), or -1 to keep the core's item-class template fallback.
const setChestSlotOverride = (roomId: number, slot: number, newItem: number, messageId = -1): void => {
  // The chest path bails on high-bit ids and the grant tables hold 76 entries,
  // so an out-of-range override would open as an empty chest. Refuse it here.
  if (!isGrantableReceiveId(newItem)) {
    log.error(`[Randomizer] Override refused: item id 0x${newItem.toString(16)} is outside the native grant table (room ${roomId} slot ${slot})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setChestSlotOverride called with no active module');
    return;
  }
  // Arm kFeatures3_ItemOverrides alongside writing the table. The write itself is ungated (it only
  // records, see the note in item_overrides.c), but the gate must be requested here so it has
  // latched into WRAM (SyncGateWords, next frame) by the time a chest applies the table; it stays
  // open only while the table has entries (see itemOverridesActive in live-settings-flags.ts), so
  // no leftover table can silently reapply outside an active randomizer session.
  setItemOverridesActive(true);
  reassertGateWord3();
  mod.ccall('WasmSetChestSlotOverride', null, ['number', 'number', 'number', 'number'],
    [roomId, slot, newItem, messageId]);
  log.randomizer(`[Randomizer] Override set: room ${roomId} slot ${slot} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

const clearItemOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Empty the table, then close the gate. The table is empty either way, but closing the gate
  // keeps it from reopening for stale data if something else re-populates it without going
  // through setChestSlotOverride.
  mod.ccall('WasmClearItemOverrides', null, [], []);
  setItemOverridesActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All overrides cleared');
};

export { clearItemOverrides, setChestSlotOverride };
