/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { isArmableOverrideId } from '../foreign-item-id';
import { getModule } from '@rotp/game-core';
import { setDropOverridesActive } from '@rotp/game-core';
import { reassertGateWord3 } from '../live-settings';
import { DROP_NO_FIRE_ID, TEMPLATE_MESSAGE } from './drop-overrides.constants';

const setDropOverride = (
  roomId: number, big: boolean, newItem: number, messageId = TEMPLATE_MESSAGE, fireId = DROP_NO_FIRE_ID,
): void => {
  if (!isArmableOverrideId(newItem)) {
    log.error(`[Randomizer] Drop override refused: item 0x${newItem.toString(16)} `
      + `is outside the native grant table (room ${roomId})`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setDropOverride called with no active module');
    return;
  }
  setDropOverridesActive(true);
  reassertGateWord3();
  mod.ccall('WasmSetDropOverride', null, ['number', 'number', 'number', 'number', 'number'],
    [roomId, big ? 1 : 0, newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Drop override set: room ${roomId} ${big ? 'big' : 'small'} `
    + `-> 0x${newItem.toString(16)} (msg ${messageId})`);
};

export { setDropOverride };
