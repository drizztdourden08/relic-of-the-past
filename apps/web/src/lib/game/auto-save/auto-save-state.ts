/* @layer bridge-wasm @kind logic */
const autoSaveState = {
  interval: null as ReturnType<typeof setInterval> | null,
  changeListeners: new Set<() => void>(),
};

export { autoSaveState };
