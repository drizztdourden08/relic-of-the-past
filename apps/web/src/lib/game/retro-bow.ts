/* @layer bridge-wasm @kind logic */
/**
 * Retro bow — JS-side arming for the in-core rupee bow
 * (core/game-hooks/retro_bow.c): the two costs a shot takes out of the wallet,
 * the plain one and the silver one.
 *
 * Same contract as the other override bridges: the write only records, the
 * gate bit is requested alongside it so it has latched into WRAM
 * (SyncGateWords, next frame) by the time a shot is fired, and it stays open
 * only while a retro session is armed — a stale pair of costs can never start
 * charging for shots again because some unrelated setting changed.
 */

import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setRetroBowActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';
import type { RetroBowSetting } from '@shared/randomizer/ap-world/retro/retro.type';

const setRetroBow = (setting: RetroBowSetting): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setRetroBow called with no active module');
    return;
  }
  setRetroBowActive(true);
  reassertGateWord3();
  mod.ccall('WasmSetRetroBow', null, ['number', 'number'],
    [Math.trunc(setting.woodArrowCost), Math.trunc(setting.silverArrowCost)]);
  log.randomizer(`[Randomizer] Retro bow armed: plain ${setting.woodArrowCost}, `
    + `silver ${setting.silverArrowCost}`);
};

const clearRetroBow = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Empty the costs, then close the gate — the same double lock as the tables.
  mod.ccall('WasmClearRetroBow', null, [], []);
  setRetroBowActive(false);
  reassertGateWord3();
};

export { clearRetroBow, setRetroBow };
