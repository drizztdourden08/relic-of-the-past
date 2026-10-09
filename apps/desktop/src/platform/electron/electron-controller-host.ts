/* @layer renderer-other @kind logic */
import type { ControllerHost } from '@shared/platform';
import { appApi } from '@app/ipc/app-api';

const createElectronControllerHost = (): ControllerHost => ({
  enumerate: async () => [],
  getOpenKeys: async () => [],
  write: async () => false,
  vibratePattern: (deviceKey, pattern, gapMs) => appApi().vibratePattern(deviceKey, pattern, gapMs),
  onReport: () => () => {},
  onDeviceOpened: () => () => {},
  onDisconnect: () => () => {},
  onError: () => () => {},
  onMainPerf: () => () => {},
  onControllerState: (cb) => appApi().onControllerState(cb),
});

export { createElectronControllerHost };
