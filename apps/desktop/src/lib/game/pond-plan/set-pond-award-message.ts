/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';

const setPondAwardMessage = (more: number, last: number): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setPondAwardMessage called with no active module');
    return;
  }
  mod.ccall('WasmSetPondAwardMessage', null, ['number', 'number'], [more, last]);
  log.randomizer(`[Randomizer] Pond award lines -> msg ${more} (more to come), msg ${last} (the last)`);
};

export { setPondAwardMessage };
