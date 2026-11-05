/* @layer bridge-wasm @kind logic */
import { cancelledActions } from './cancelled-actions';
import { notify } from './notify';
import { queueState } from './queue-state';

const remove = (id: string): boolean => {
  const idx = queueState.queue.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  cancelledActions.add(queueState.queue[idx].action);
  queueState.queue.splice(idx, 1);
  notify();
  return true;
};

export { remove };
