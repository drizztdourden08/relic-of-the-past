/* @layer renderer-app @kind logic */
const listeners = new Set<() => void>();

const onStateLoaded = (cb: () => void): (() => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const notifyStateLoaded = (): void => {
  for (const cb of listeners) cb();
};

export { notifyStateLoaded, onStateLoaded };
