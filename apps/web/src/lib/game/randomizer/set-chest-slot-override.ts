/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { isArmableOverrideId } from '../foreign-item-id';
import { getModule } from '../wasm-bridge';
import { setItemOverridesActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const setChestSlotOverride = (roomId: number, slot: number, newItem: number, messageId = -1): void => {
  if (!isArmableOverrideId(newItem)) {
    log.error(`[Randomizer] Override refused: item id 0x${newItem.toString(16)} is outside the native grant table (room ${roomId} slot ${slot})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setChestSlotOverride called with no active module');
    return;
  }
  setItemOverridesActive(true);
  reassertGateWord3();
  mod.ccall('WasmSetChestSlotOverride', null, ['number', 'number', 'number', 'number'],
    [roomId, slot, newItem, messageId]);
  log.randomizer(`[Randomizer] Override set: room ${roomId} slot ${slot} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

export { setChestSlotOverride };
