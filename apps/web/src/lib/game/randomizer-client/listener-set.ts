/* @layer bridge-wasm @kind logic */
/** A set of listeners with an unsubscribe per add, where one listener that throws never stops the rest. */

interface ListenerSet<A extends unknown[]> {
  readonly size: number;
  add(listener: (...args: A) => void): () => void;
  emit(...args: A): void;
}

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
        try { listener(...args); } catch { /* a bad listener never breaks the session */ }
      }
    },
  };
};

export { createListenerSet };
export type { ListenerSet };
