/* @layer bridge-wasm @kind logic */
const notifyListeners = <T>(listeners: Iterable<(value: T) => void>, value: T): void => {
  for (const fn of listeners) {
    try { fn(value); } catch { continue; }
  }
};

export { notifyListeners };
