/* @layer bridge-wasm @kind logic */
import type { ShopSlotTarget } from './shop-overrides.type';
import { log } from '../../log-bus';
import { isArmableOverrideId } from '../foreign-item-id';
import { getModule } from '../wasm-bridge';
import { setShopOverridesActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';
import { SHOP_SLOT_ARG_COUNT } from './shop-overrides.constants';

const setShopSlotOverride = (
  target: ShopSlotTarget, newItem: number, messageId = -1, fireId = -1,
): void => {
  const { slotIndex, roomId, entrance, owArea, subtype, depthIndex, depth, currency, amount } = target;
  if (!isArmableOverrideId(newItem)) {
    log.error(`[Randomizer] Shop slot override refused: item 0x${newItem.toString(16)} `
      + `is outside the grantable id range (room 0x${roomId.toString(16)} subtype ${subtype})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setShopSlotOverride called with no active module');
    return;
  }
  setShopOverridesActive(true);
  reassertGateWord3();
  mod.ccall('WasmSetShopSlotOverride', null,
    Array.from({ length: SHOP_SLOT_ARG_COUNT }, () => 'number'),
    [slotIndex, roomId, entrance, owArea, subtype, depthIndex, depth, currency, amount,
      newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Shop slot override set: room 0x${roomId.toString(16)} area ${owArea} `
    + `subtype ${subtype} step ${depthIndex + 1}/${depth} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

export { setShopSlotOverride };
