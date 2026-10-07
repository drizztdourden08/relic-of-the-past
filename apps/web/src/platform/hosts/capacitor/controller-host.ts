/* @layer renderer-other @kind logic */
/**
 * Capacitor ControllerHost: the ControllerSdl3 plugin
 * (apps/mobile/android/.../controllersdl3/ControllerSdl3Plugin.java) runs the
 * SDL3 gamepad backend inside the app's own WebView process on Android. This
 * host starts the plugin once, decodes its added/removed/state events into a
 * live device map (controller-sdl3-store.ts), and answers decoded button/axis
 * state and rumble through the ControllerHost port like the desktop SDL3 addon.
 * The raw-HID members of the port (write, onReport, onDeviceOpened, getOpenKeys,
 * onMainPerf) have no SDL3 equivalent and stay no-ops, same as on desktop.
 *
 * The device snapshot ('controller:list' / 'controller:devices' /
 * 'controller:removed') is not part of this port; the device list and
 * calibration screens read those off window.api, so creating this host also
 * installs real implementations for that trio (install-controller-api.ts).
 *
 * When the native library fails to load (wrong ABI, missing .so) or SDL fails
 * to init, the plugin's start() resolves `{ ok: false }` instead of throwing
 * (see Sdl3Bridge.java). This host then never starts listening, so every
 * surface reports zero controllers, like a desktop build with no SDL3 addon.
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
    // polling for gamepad events while backgrounded, restart on return, instead
    // of leaving the native subsystem running while the app isn't visible.
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
