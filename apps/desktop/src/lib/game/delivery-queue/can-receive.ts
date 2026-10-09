/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';
import { CAN_RECEIVE } from './delivery-queue.constants';

const canReceive = (): boolean => {
  const mod = getModule();
  if (!mod) return false;
  return mod.ccall('WasmCanReceiveItem', 'number', [], []) === CAN_RECEIVE;
};

export { canReceive };
