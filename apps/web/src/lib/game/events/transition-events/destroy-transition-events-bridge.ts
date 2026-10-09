/* @layer bridge-wasm @kind logic */
const destroyTransitionEventsBridge = (): void => {
  Object.assign(window, { __onTransitionSettled: null });
};

export { destroyTransitionEventsBridge };
