/* @layer bridge-wasm @kind logic */
import type { ListenerSet } from './listener-set.type';

const createListenerSet = <A extends unknown[]>(): ListenerSet<A> => {
  const listeners = new Set<(...args: A) => void>();
  return {
    get size() { return listeners.size; },
    add(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    emit(...args) {
      for (const listener of listeners) {
        try { listener(...args); } catch { continue; }
      }
    },
  };
};

export { createListenerSet };
export type { ListenerSet } from './listener-set.type';
