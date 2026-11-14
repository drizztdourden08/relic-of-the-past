/* @layer renderer-lib @kind logic */
import type { InputProfile } from '@rotp/input-mapping';
import { TOUCH_DEVICE_PRODUCT_ID, TOUCH_DEVICE_VENDOR_ID } from './touch-device.constants';

const sameId = (a: string, b: string): boolean => Number.parseInt(a, 16) === Number.parseInt(b, 16);

const isTouchProfile = (profile: InputProfile | null): boolean => {
  const assigned = profile?.assignedDevice;
  if (!profile || !assigned) return false;
  return sameId(assigned.vendorId, TOUCH_DEVICE_VENDOR_ID)
    && sameId(assigned.productId, TOUCH_DEVICE_PRODUCT_ID)
    && profile.mappings.length > 0;
};

export { isTouchProfile };
