/* @layer bridge-wasm @kind logic */
import { notify } from './notify';
import { queueState } from './queue-state';
import { sharedEngine } from './shared-engine';

const clear = (): void => {
  sharedEngine.clear();
  queueState.queue = [];
  queueState.delivering = null;
  notify();
};

export { clear };
