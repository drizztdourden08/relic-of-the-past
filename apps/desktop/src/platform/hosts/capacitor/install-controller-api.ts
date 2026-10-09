/* @layer renderer-other @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { AppApi } from '@app/ipc/app-api.type';
import type { Sdl3ControllerStore } from './controller-sdl3-store';

const installControllerApi = (store: Sdl3ControllerStore): void => {
  const target = window as unknown as { api: AppApi };
  target.api = {
    ...appApi(),
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
