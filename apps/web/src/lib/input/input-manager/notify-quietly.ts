/* @layer renderer-lib @kind logic */
const notifyQuietly = <T extends unknown[]>(listeners: Iterable<(...args: T) => void>, ...args: T): void => {
  for (const fn of listeners) {
    try { fn(...args); } catch { continue; }
  }
};

export { notifyQuietly };
