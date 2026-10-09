/* @layer bridge-wasm @kind logic */
import type { PondThrowArm } from '@rotp/randomizer';
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';
import { setPondPlanActive } from '@rotp/game-core';
import { reassertGateWord3 } from '../live-settings';

const setPondThrows = (throws: readonly PondThrowArm[]): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setPondThrows called with no active module');
    return;
  }
  setPondPlanActive(true);
  reassertGateWord3();
  mod.ccall('WasmClearPondPlan', null, [], []);
  throws.forEach((entry, index) => {
    mod.ccall('WasmSetPondThrow', null, ['number', 'number', 'number', 'number', 'number', 'number'],
      [index, Math.trunc(entry.price), Math.trunc(entry.prize), Math.trunc(entry.refund),
        entry.prompt, entry.consolation]);
  });
  log.randomizer(`[Randomizer] Pond plan set: ${throws.length} throws `
    + `[${throws.map((entry) => entry.price).join(', ')}]`);
};

export { setPondThrows };
