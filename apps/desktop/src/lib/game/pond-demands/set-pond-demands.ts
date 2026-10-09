/* @layer bridge-wasm @kind logic */
import type { PondDemandArm } from '@rotp/randomizer';
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';

const setPondDemands = (demands: readonly PondDemandArm[]): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setPondDemands called with no active module');
    return;
  }
  mod.ccall('WasmClearPondDemands', null, [], []);
  demands.forEach(({ pond, rung, kind, amount, nativeId, askMessageId, refuseMessageId, awardMessageId }) => {
    mod.ccall('WasmArmPondDemand', null, ['number', 'number', 'number', 'number', 'number'],
      [pond, rung, kind, amount, nativeId]);
    mod.ccall('WasmSetPondDemandLines', null, ['number', 'number', 'number', 'number', 'number'],
      [pond, rung, askMessageId, refuseMessageId, awardMessageId]);
  });
  log.randomizer(`[Randomizer] Pond demands set: ${demands.length} rungs`);
};

export { setPondDemands };
