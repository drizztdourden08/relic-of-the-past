/* @layer bridge-wasm @kind logic */
import { clear } from '@rotp/randomizer';
import { enqueue } from '@rotp/randomizer';
import { getState } from '@rotp/randomizer';
import { peek } from '@rotp/randomizer';
import { remove } from '@rotp/randomizer';
import { size } from '@rotp/randomizer';
import { startProcessing } from './start-processing';
import { stopProcessing } from '@rotp/randomizer';
import { subscribe } from '@rotp/randomizer';

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
