/* @layer bridge-wasm @kind logic */
const disarmOverrideFiredEvents = (): void => {
  Object.assign(window, { __onOverrideFired: null });
};

export { disarmOverrideFiredEvents };
