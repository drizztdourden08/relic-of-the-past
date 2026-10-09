/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';

const setPondClosedMessage = (messageId: number): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setPondClosedMessage called with no active module');
    return;
  }
  mod.ccall('WasmSetPondClosedMessage', null, ['number'], [messageId]);
  log.randomizer(`[Randomizer] Pond closing line -> msg ${messageId}`);
};

export { setPondClosedMessage };
