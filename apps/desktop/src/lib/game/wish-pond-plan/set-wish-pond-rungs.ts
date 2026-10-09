/* @layer bridge-wasm @kind logic */
import type { WishPondRungArm } from '@rotp/randomizer';
import { log } from '../../log-bus';
import { isArmableOverrideId } from '@rotp/randomizer';
import { getModule } from '@rotp/game-core';
import { setWishPondPlanActive } from '../item-power';

const setWishPondRungs = (rungs: readonly WishPondRungArm[]): void => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setWishPondRungs called with no active module');
    return;
  }
  const grantable = rungs.filter((arm) => {
    if (isArmableOverrideId(arm.newItem)) return true;
    log.error(`[Randomizer] Wish pond rung refused: item 0x${arm.newItem.toString(16)} `
      + `is outside the grantable id range (pond ${arm.pond}, rung ${arm.rung})`);
    return false;
  });
  mod.ccall('WasmClearWishPondPlan', null, [], []);
  setWishPondPlanActive(grantable.length > 0);
  grantable.forEach((arm) => {
    mod.ccall('WasmArmWishPondPlan', null, ['number', 'number', 'number', 'number', 'number', 'number'],
      [arm.pond, arm.rung, arm.newItem, arm.messageId, arm.fireId, arm.assigned ? 1 : 0]);
  });
  log.randomizer(`[Randomizer] Wish pond plan set: ${grantable.length} rungs`);
};

export { setWishPondRungs };
