/* @layer bridge-wasm @kind logic */
import type { ScriptedGrantSurface } from '@rotp/randomizer';
import { log } from '../../log-bus';
import { isArmableOverrideId } from '@rotp/randomizer';
import { getModule, setScriptedGrantsActive } from '@rotp/game-core';
import { reassertGateWord3 } from '../live-settings';
import { armCall } from './arm-call';

const setScriptedGrantOverride = (target: ScriptedGrantSurface, newItem: number,
  messageId = -1, fireId = -1): void => {
  if (target.surface === 'wish-pond') {
    log.error('[Randomizer] Scripted grant override refused: a wish-pond rung arms with its whole table, '
      + `never one at a time (pond ${target.pond}, rung ${target.rung})`);
    return;
  }
  if (!isArmableOverrideId(newItem)) {
    log.error(`[Randomizer] Scripted grant override refused: item 0x${newItem.toString(16)} `
      + `is outside the grantable id range (${target.surface})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setScriptedGrantOverride called with no active module');
    return;
  }
  const ridesPondPlanGate = target.surface === 'pond';
  if (!ridesPondPlanGate) {
    setScriptedGrantsActive(true);
    reassertGateWord3();
  }
  armCall({ mod, target, newItem, messageId, fireId });
  log.randomizer(`[Randomizer] Scripted grant override set: ${target.surface} `
    + `-> 0x${newItem.toString(16)} (msg ${messageId})`);
};

export { setScriptedGrantOverride };
