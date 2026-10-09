/* @layer renderer-other @kind logic */
import type { DeviceKeySlots } from './controller-sdl3-device-key.type';

const deviceKeySlots: DeviceKeySlots = {
  byId: new Map(),
  usedSlots: new Map(),
};

export { deviceKeySlots };
