/* @layer bridge-wasm @kind logic */
import { isNativeReceiveId } from '@rotp/game-data';
import { log } from '../../log-bus';
import { isArmableOverrideId } from '../foreign-item-id';

const refuseNpcOverride = (vanillaItem: number, newItem: number, where: string): boolean => {
  if (isNativeReceiveId(vanillaItem) && isArmableOverrideId(newItem)) return false;
  log.error(`[Randomizer] Npc override refused: item pair 0x${vanillaItem.toString(16)} -> `
    + `0x${newItem.toString(16)} is outside the native grant table (${where})`);
  return true;
};

export { refuseNpcOverride };
