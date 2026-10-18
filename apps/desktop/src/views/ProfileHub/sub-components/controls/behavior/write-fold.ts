/* @layer renderer-components @kind logic */
const writeFold = (storageKey: string, collapsed: boolean): boolean => {
  try {
    localStorage.setItem(storageKey, String(collapsed));
    return true;
  } catch {
    return false;
  }
};

export { writeFold };
