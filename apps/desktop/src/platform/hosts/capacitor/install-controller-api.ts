/* @layer renderer-other @kind logic */
import type { Sdl3ControllerStore } from './controller-sdl3-store';

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
