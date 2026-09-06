/* @layer bridge-wasm @kind logic */
/**
 * Drop overrides: JS-side arming for the in-core key-drop substitution table
 * (core/game-hooks/drop_overrides.c), mirroring the npc table's contract in
 * npc-grant-overrides.ts: the write only records, the gate bit is requested
 * alongside it, and it stays open only while the table has entries.
 */

import { isGrantableReceiveId } from '@shared/game/data';
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setDropOverridesActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';

// |messageId| is the pre-rendered contextual receipt line for this grant (session
// dialogue), or -1 to keep the core's item-class template fallback. |fireId| is the
// host-assigned completion id reported when the entry substitutes, or -1 for none.
const setDropOverride = (roomId: number, big: boolean, newItem: number, messageId = -1, fireId = -1): void => {
  // The id indexes the 76-entry native grant tables, so an out-of-range one would
  // corrupt the receipt, so refuse it here like the other override setters do.
  if (!isGrantableReceiveId(newItem)) {
    log.error(`[Randomizer] Drop override refused: item 0x${newItem.toString(16)} `
      + `is outside the native grant table (room ${roomId})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setDropOverride called with no active module');
    return;
  }
  // Arm kFeatures3_DropOverrides alongside writing the table. The write itself is
  // ungated (record-only), but the gate must be requested here so it has latched into
  // WRAM (SyncGateWords, next frame) by the time a drop applies the table.
  setDropOverridesActive(true);
  reassertGateWord3();
  mod.ccall('WasmSetDropOverride', null, ['number', 'number', 'number', 'number', 'number'],
    [roomId, big ? 1 : 0, newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Drop override set: room ${roomId} ${big ? 'big' : 'small'} `
    + `-> 0x${newItem.toString(16)} (msg ${messageId})`);
};

const clearDropOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Empty the table, then close the gate, same double lock as clearItemOverrides.
  mod.ccall('WasmClearDropOverrides', null, [], []);
  setDropOverridesActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All drop overrides cleared');
};

export { clearDropOverrides, setDropOverride };
