/* @layer renderer-other @kind logic */
/**
 * Capacitor ControllerHost: the ControllerSdl3 plugin (see
 * apps/mobile/android/.../controllersdl3/ControllerSdl3Plugin.java) runs the
 * SDL3 gamepad backend inside the app's own WebView process on Android, so
 * this host is a real controller transport. It starts the plugin once,
 * decodes its added/removed/state events into a live device map
 * (controller-sdl3-store.ts), and answers already-decoded button/axis state
 * and rumble through the ControllerHost port the same way the desktop SDL3
 * addon does. The raw-HID members of the port (write, onReport,
 * onDeviceOpened, getOpenKeys, onMainPerf) have no SDL3 equivalent here and
 * stay honest no-ops, same as on desktop.
 *
 * The device snapshot itself ('controller:list' / 'controller:devices' /
 * 'controller:removed') is not part of this port; the device list and
 * calibration screens read those straight off window.api on every platform.
 * Creating this host therefore also installs real implementations for that
 * trio (install-controller-api.ts), replacing the boot-safe empties from
 * api-shim.ts.
 *
 * When the native library fails to load (wrong ABI, missing .so) or SDL
 * itself fails to init, the plugin's start() resolves `{ ok: false }`
 * instead of throwing (see Sdl3Bridge.java). This host then simply never
 * starts listening for events, so every surface above it reports zero
 * controllers, the same as a desktop build with no SDL3 addon.
 */
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
    // Symmetric with createCapacitorDevice's own onAppPause listener: stop
    // polling for gamepad events while backgrounded, restart on return,
    // rather than leaving the native subsystem running the whole time the
    // app isn't visible.
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
