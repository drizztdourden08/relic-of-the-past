/* @layer bridge-wasm @kind logic */
const revisionState = {
  revision: 0,
  listeners: new Set<() => void>(),
};

export { revisionState };
