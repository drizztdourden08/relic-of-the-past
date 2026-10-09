/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';
import { CAN_RECEIVE } from './delivery-queue.constants';

const canReceive = (): boolean => {
  const mod = getModule();
  if (!mod) return false;
  return mod.ccall('WasmCanReceiveItem', 'number', [], []) === CAN_RECEIVE;
};

export { canReceive };
