/* @layer renderer-other @kind logic */
import { App } from '@capacitor/app';
import type { ControllerHost } from '@shared/platform';
import { sdl3ControllerStore } from './controller-sdl3-store';
import { installControllerApi } from './install-controller-api';

let installed = false;

const createCapacitorControllerHost = (): ControllerHost => {
  if (!installed) {
    installed = true;
    installControllerApi(sdl3ControllerStore);
    sdl3ControllerStore.start().catch(() => {});
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) sdl3ControllerStore.start().catch(() => {});
      else sdl3ControllerStore.stop();
    });
  }

  return {
    enumerate: () => Promise.resolve(sdl3ControllerStore.hidDeviceInfoSnapshot()),
    getOpenKeys: () => Promise.resolve([]),
    write: () => Promise.resolve(false),
    vibratePattern: (deviceKey, pattern, gapMs) => sdl3ControllerStore.vibratePattern(deviceKey, pattern, gapMs),
    onReport: () => () => {},
    onDeviceOpened: () => () => {},
    onDisconnect: () => () => {},
    onError: () => () => {},
    onMainPerf: () => () => {},
    onControllerState: (cb) => sdl3ControllerStore.onControllerState(cb),
  };
};

export { createCapacitorControllerHost };
