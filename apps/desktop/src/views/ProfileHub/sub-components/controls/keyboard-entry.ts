/* @layer renderer-components @kind logic */
import type { DetectedDevice } from '@rotp/input-mapping';
import { DEVICE_FAMILY_ICON, GENERIC_DEVICE_ICON, SDL_TYPE_ICON } from './controls.constants';
import type { DeviceEntry } from './DeviceRow.type';

const keyboardEntry = (device: DetectedDevice): DeviceEntry => {
  const { id, displayName, deviceFamily, sdlType } = device;
  return {
    key: id,
    drag: { id, displayName, sdlType, vendorId: null, productId: null },
    family: deviceFamily,
    iconSrc: (sdlType && SDL_TYPE_ICON[sdlType]) ?? DEVICE_FAMILY_ICON[deviceFamily] ?? GENERIC_DEVICE_ICON,
    meta: 'Ready',
    ready: true,
    unavailable: false,
  };
};

export { keyboardEntry };
