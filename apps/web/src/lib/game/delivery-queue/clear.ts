/* @layer bridge-wasm @kind logic */
import { fireComplete } from './fire-complete';
import { notify } from './notify';
import { queueState } from './queue-state';

const clear = (): void => {
  const dropped = queueState.delivering ? [queueState.delivering, ...queueState.queue] : [...queueState.queue];
  queueState.queue = [];
  queueState.delivering = null;
  queueState.deliveringBecameBusy = false;
  queueState.deliveringFrames = 0;
  queueState.cooldownFrames = 0;
  notify();
  for (const entry of dropped) fireComplete(entry);
};

export { clear };
