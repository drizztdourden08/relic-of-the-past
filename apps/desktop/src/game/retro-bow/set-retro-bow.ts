/* @layer bridge-wasm @kind logic */
import type { RetroBowSetting } from '@rotp/randomizer';
import { log } from '../../log-bus';
import { getModule, setRetroBowActive } from '@rotp/game-core';
import { reassertGateWord3 } from '../live-settings';

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

export { setRetroBow };
