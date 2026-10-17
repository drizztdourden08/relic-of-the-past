/* @layer renderer-components @kind logic */
const readFold = (storageKey: string): boolean | null => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw === null ? null : raw === 'true';
  } catch {
    return null;
  }
};

export { readFold };
