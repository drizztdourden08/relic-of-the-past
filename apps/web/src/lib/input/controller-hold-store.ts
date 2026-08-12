/* @layer renderer-lib @kind logic */
/**
 * Renderer wrappers for the controller exclusive-hold contract: dropping SDL's
 * exclusive claim so a raw HID open can succeed (diagnostics byte capture),
 * and restoring it afterward so normal joystick-level input comes back.
 * Desktop-only, same as native-capture-store.ts and controller-devices-store.ts
 * next to it. window.api is always present, so these are thin pass-throughs.
 */

const releaseHold = (): Promise<boolean> => window.api.releaseControllerHold();

const restoreHold = (): Promise<boolean> => window.api.restoreControllerHold();

const onHoldChanged = (callback: (held: boolean) => void): (() => void) =>
  window.api.onControllerHoldChanged(callback);

export { onHoldChanged, releaseHold, restoreHold };
