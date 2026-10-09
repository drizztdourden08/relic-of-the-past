/* @layer bridge-wasm @kind logic */
import type { StandingOverrideTarget } from './standing-overrides.type';
import { log } from '../../log-bus';
import { isArmableOverrideId } from '../foreign-item-id';
import { getModule } from '../wasm-bridge';
import { setStandingOverridesActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const setStandingOverride = (target: StandingOverrideTarget, newItem: number, messageId = -1, fireId = -1): void => {
  const { area, indoors, sprite, half } = target;
  if (!isArmableOverrideId(newItem)) {
    log.error(`[Randomizer] Standing override refused: item 0x${newItem.toString(16)} `
      + `is outside the native grant table (area ${area})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setStandingOverride called with no active module');
    return;
  }
  setStandingOverridesActive(true);
  reassertGateWord3();
  mod.ccall('WasmSetStandingOverride', null,
    ['number', 'number', 'number', 'number', 'number', 'number', 'number'],
    [area, indoors ? 1 : 0, sprite, half, newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Standing override set: ${indoors ? 'room' : 'screen'} ${area} `
    + `sprite 0x${sprite.toString(16)} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

export { setStandingOverride };
