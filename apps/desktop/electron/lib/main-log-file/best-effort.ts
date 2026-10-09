/* @layer electron-main @kind logic */
const bestEffort = (write: () => void): void => {
  try {
    write();
  } catch {
    return;
  }
};

export { bestEffort };
