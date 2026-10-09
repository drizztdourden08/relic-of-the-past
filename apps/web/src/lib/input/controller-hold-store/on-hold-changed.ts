/* @layer renderer-lib @kind logic */
const onHoldChanged = (callback: (held: boolean) => void): (() => void) =>
  window.api.onControllerHoldChanged(callback);

export { onHoldChanged };
