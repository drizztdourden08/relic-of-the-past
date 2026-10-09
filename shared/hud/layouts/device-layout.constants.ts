/* @layer shared-hud @kind constants */
import { DEFAULT_LAYOUT } from './built-in-layouts';
import type { LayoutDeviceKind } from './device-layout.type';

const DEVICE_LAYOUTS: Readonly<Record<LayoutDeviceKind, string>> = {
  gamepad: DEFAULT_LAYOUT.id,
  keyboard: DEFAULT_LAYOUT.id,
};

export { DEVICE_LAYOUTS };
