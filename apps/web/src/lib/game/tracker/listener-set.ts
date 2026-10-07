/* @layer bridge-wasm @kind logic */
/** A set of listeners that a bad one can never break: each is called in its own try. */

interface ListenerSet<Args extends unknown[]> {
  add: (fn: (...args: Args) => void) => () => void;
  notify: (...args: Args) => void;
}

const createListenerSet = <Args extends unknown[]>(): ListenerSet<Args> => {
  const set = new Set<(...args: Args) => void>();
  return {
    add: (fn) => {
      set.add(fn);
      return () => set.delete(fn);
    },
    notify: (...args) => {
      for (const fn of set) {
        try { fn(...args); } catch { /* ignore */ }
      }
    },
  };
};

export { createListenerSet };
export type { ListenerSet };
