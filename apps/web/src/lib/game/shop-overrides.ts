/* @layer bridge-wasm @kind logic */
/**
 * Shelf-slot overrides — JS-side arming for the in-core substitution table
 * that turns a shop shelf into a randomizer location
 * (core/game-hooks/shop_overrides.c). One entry per purchase: a slot stocked
 * to depth N is armed as N entries sharing a shelf key and differing only in
 * their depth index, and the core sells them in that order.
 *
 * Same contract as the other override bridges: the write only records, the
 * gate bit is requested alongside it, and it stays open only while armed.
 */

import { isGrantableReceiveId } from '@shared/game/data';
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { setShopOverridesActive } from './live-settings-flags';
import { reassertGateWord3 } from './live-settings';

interface ShopSlotTarget {
  /** The slot's stable id across every shop, which keys its sold counter. */
  slotIndex: number;
  /** Indoor room index the shelf stands in. */
  roomId: number;
  /** Entrance identifying the shop when its room is shared, or -1 for any. */
  entrance: number;
  /** Overworld area of the shop's own door, telling shared doors apart, or -1 for any. */
  owArea: number;
  /** The selling sprite's subtype — one purchasable spot inside the shop. */
  subtype: number;
  /** Which purchase of the slot this is; the shelf sells 0 first. */
  depthIndex: number;
  /** Total purchases the slot carries, so the core knows when it empties. */
  depth: number;
  /** Native currency tag: rupees, arrows, bombs, hearts, or a bottle's contents. */
  currency: number;
  /** The amount, or the bottle-slot value a bottle price demands. */
  amount: number;
}

// |messageId| is the pre-rendered contextual receipt line for this purchase, or -1 for
// the core's item-class template fallback. |fireId| is the host-assigned completion id
// reported the moment the purchase substitutes, or -1 for none.
const setShopSlotOverride = (
  target: ShopSlotTarget, newItem: number, messageId = -1, fireId = -1,
): void => {
  const { slotIndex, roomId, entrance, owArea, subtype, depthIndex, depth, currency, amount } = target;
  if (!isGrantableReceiveId(newItem)) {
    log.error(`[Randomizer] Shop slot override refused: item 0x${newItem.toString(16)} `
      + `is outside the grantable id range (room 0x${roomId.toString(16)} subtype ${subtype})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setShopSlotOverride called with no active module');
    return;
  }
  // Arm kFeatures3_ShopOverrides alongside the record-only write, so the gate has
  // latched into WRAM (SyncGateWords, next frame) by the time a shelf applies it.
  setShopOverridesActive(true);
  reassertGateWord3();
  mod.ccall('WasmSetShopSlotOverride', null,
    Array.from({ length: 12 }, () => 'number'),
    [slotIndex, roomId, entrance, owArea, subtype, depthIndex, depth, currency, amount,
      newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Shop slot override set: room 0x${roomId.toString(16)} area ${owArea} `
    + `subtype ${subtype} step ${depthIndex + 1}/${depth} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

const clearShopSlotOverrides = (): void => {
  const mod = getModule();
  if (!mod) return;
  // Empty the table, then close the gate — same double lock as the other tables.
  mod.ccall('WasmClearShopSlotOverrides', null, [], []);
  setShopOverridesActive(false);
  reassertGateWord3();
  log.randomizer('[Randomizer] All shop slot overrides cleared');
};

export { clearShopSlotOverrides, setShopSlotOverride };
export type { ShopSlotTarget };
