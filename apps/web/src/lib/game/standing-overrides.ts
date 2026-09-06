/* @layer bridge-wasm @kind logic */
/**
 * Standing overrides: JS-side arming for the in-core standing-prize
 * substitution table (core/game-hooks/standing_overrides.c), mirroring the
 * drop table's contract in drop-overrides.ts: the write only records, the
 * gate bit is requested alongside it, and it stays open only while the table
 * has entries.
 */

import { isGrantableReceiveId } from '@shared/game/data';
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setStandingOverridesActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';

interface StandingOverrideTarget {
  /** Overworld screen index (outdoor) or room index (indoor). */
  area: number;
  indoors: boolean;
  /** The standing prize's sprite type. */
  sprite: number;
  /** Indoor room half the prize stands in: 0 = left, 1 = right, 2 = either. */
  half: number;
}

// |messageId| is the pre-rendered contextual receipt line for this grant (session
// dialogue), or -1 for the core's item-class template fallback. |fireId| is the
// host-assigned completion id reported when the entry substitutes, or -1 for none.
const setStandingOverride = (target: StandingOverrideTarget, newItem: number, messageId = -1, fireId = -1): void => {
  const { area, indoors, sprite, half } = target;
  // The id indexes the 76-entry native grant tables, so an out-of-range one would
  // corrupt the receipt, so refuse it here like the other override setters do.
  if (!isGrantableReceiveId(newItem)) {
    log.error(`[Randomizer] Standing override refused: item 0x${newItem.toString(16)} `
      + `is outside the native grant table (area ${area})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setStandingOverride called with no active module');
    return;
  }
  // Arm kFeatures3_StandingOverrides alongside writing the table. The write itself is
  // ungated (record-only), but the gate must be requested here so it has latched into
  // WRAM (SyncGateWords, next frame) by the time a pickup applies the table.
  setStandingOverridesActive(true);
  reassertGateWord3();
  mod.ccall('WasmSetStandingOverride', null,
    ['number', 'number', 'number', 'number', 'number', 'number', 'number'],
    [area, indoors ? 1 : 0, sprite, half, newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Standing override set: ${indoors ? 'room' : 'screen'} ${area} `
    + `sprite 0x${sprite.toString(16)} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

const clearStandingOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Empty the table, then close the gate, same double lock as clearItemOverrides.
  mod.ccall('WasmClearStandingOverrides', null, [], []);
  setStandingOverridesActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All standing overrides cleared');
};

export { clearStandingOverrides, setStandingOverride };
export type { StandingOverrideTarget };
