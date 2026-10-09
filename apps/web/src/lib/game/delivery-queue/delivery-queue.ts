/* @layer bridge-wasm @kind logic */
import { clear } from './clear';
import { enqueue } from './enqueue';
import { getState } from './get-state';
import { peek } from './peek';
import { remove } from './remove';
import { size } from './size';
import { startProcessing } from './start-processing';
import { stopProcessing } from './stop-processing';
import { subscribe } from './subscribe';

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
