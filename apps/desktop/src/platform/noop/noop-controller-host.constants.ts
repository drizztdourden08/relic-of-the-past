/* @layer renderer-other @kind constants */
import type { ControllerHost } from '@shared/platform';

const NOOP_CONTROLLER_HOST: ControllerHost = {
  enumerate: async () => [],
  getOpenKeys: async () => [],
  write: async () => false,
  vibratePattern: async () => ({ ok: false }),
  onReport: () => () => {},
  onDeviceOpened: () => () => {},
  onDisconnect: () => () => {},
  onError: () => () => {},
  onMainPerf: () => () => {},
  onControllerState: () => () => {},
};

export { NOOP_CONTROLLER_HOST };
