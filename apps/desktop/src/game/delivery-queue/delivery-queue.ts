/* @layer bridge-wasm @kind logic */
import { clear, enqueue, getState, peek, remove, size, stopProcessing, subscribe } from '@rotp/randomizer';
import { startProcessing } from './start-processing';

const deliveryQueue = {
  enqueue,
  remove,
  clear,
  peek,
  size,
  subscribe,
  getState,
  startProcessing,
  stopProcessing,
};

export { deliveryQueue };
