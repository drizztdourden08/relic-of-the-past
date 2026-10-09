/* @layer bridge-wasm @kind logic */
const stateLoadSignalState = {
  lastLoadAt: 0,
  listeners: new Set<() => void>(),
};

export { stateLoadSignalState };
