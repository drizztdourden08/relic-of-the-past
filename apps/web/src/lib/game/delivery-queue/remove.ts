/* @layer bridge-wasm @kind logic */
import { notify } from './notify';
import { queueState } from './queue-state';

const remove = (id: string): boolean => {
  const idx = queueState.queue.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  queueState.queue.splice(idx, 1);
  notify();
  return true;
};

export { remove };
