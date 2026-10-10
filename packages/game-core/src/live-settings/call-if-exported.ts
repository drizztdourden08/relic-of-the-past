/* @layer bridge-wasm @kind logic */
const callIfExported = (call: () => void): void => {
  try {
    call();
  } catch {
    
  }
};

export { callIfExported };
