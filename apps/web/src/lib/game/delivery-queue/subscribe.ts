/* @layer bridge-wasm @kind logic */
import type { StateListener } from './delivery-queue.type';
import { queueState } from './queue-state';

const subscribe = (listener: StateListener): () => void => {
  queueState.listeners.add(listener);
  return () => queueState.listeners.delete(listener);
};

export { subscribe };
