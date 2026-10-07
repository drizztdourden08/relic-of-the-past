/* @layer renderer-other @kind logic */
/**
 * Replaces the boot-safe window.api controller-device-list channels (see
 * api-shim.ts) with real implementations backed by the SDL3 store, for the
 * three the device list and calibration screens call directly, not through
 * the ControllerHost port: 'controller:list', 'controller:devices',
 * 'controller:removed'. 'controller:rescan' has no raw HID lister to re-scan
 * on this platform, so it re-emits the current snapshot. Everything else
 * controller-shaped on window.api (listHidDevices, addControllerMapping, the
 * raw-HID diagnostics wizard) stays the shim's empty default: that wizard has
 * no Android UI path.
 */
import type { Sdl3ControllerStore } from './controller-sdl3-store';

// window.api's invoke/event members type as read-only (a homomorphic mapped-type
// side effect of the `as const` channel maps, see shared/ipc/api.ts), so the
// override replaces the whole object instead of assigning into it in place.
const installControllerApi = (store: Sdl3ControllerStore): void => {
  window.api = {
    ...window.api,
    listControllers: () => Promise.resolve(store.snapshot()),
    onControllerDevices: (cb) => store.onDevicesChanged(cb),
    onControllerRemoved: (cb) => store.onRemoved(cb),
    rescanControllers: () => {
      store.rescan();
      return Promise.resolve();
    },
  };
};

export { installControllerApi };
