/* @layer bridge-wasm @kind logic */
const callIfExported = (call: () => void): void => {
  try {
    call();
  } catch {
    return undefined;
  }
};

export { callIfExported };
