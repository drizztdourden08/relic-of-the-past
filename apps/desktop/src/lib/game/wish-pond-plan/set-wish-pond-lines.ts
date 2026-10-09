/* @layer bridge-wasm @kind logic */
import type { WishPondLinesArm } from './wish-pond-plan.type';
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';

const setWishPondLines = (arm: WishPondLinesArm): void => {
  const { pond, awardMessageId, closedMessageId } = arm;
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setWishPondLines called with no active module');
    return;
  }
  mod.ccall('WasmSetWishPondLines', null, ['number', 'number', 'number'], [pond, awardMessageId, closedMessageId]);
  log.randomizer(`[Randomizer] Wish pond ${pond} lines -> award msg ${awardMessageId}, closing msg ${closedMessageId}`);
};

export { setWishPondLines };
