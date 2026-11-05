/* @layer bridge-wasm @kind logic */
import { cancelledActions } from './cancelled-actions';
import { notify } from './notify';
import { queueState } from './queue-state';

const remove = (id: string): boolean => {
  const idx = queueState.queue.findIndex((e) => e.id === id);
  const [removed] = idx === -1 ? [] : queueState.queue.splice(idx, 1);
  if (removed === undefined) return false;
  cancelledActions.add(removed.action);
  notify();
  return true;
};

export { remove };
