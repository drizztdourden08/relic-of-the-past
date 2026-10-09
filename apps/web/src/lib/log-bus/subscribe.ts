/* @layer renderer-lib @kind logic */
import type { LogListener } from './log-bus.type';
import { logRing } from './log-ring';

const subscribe = (listener: LogListener): () => void => {
  logRing.listeners.add(listener);
  return () => logRing.listeners.delete(listener);
};

export { subscribe };
