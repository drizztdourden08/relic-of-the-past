/* @layer renderer-components @kind constants */
import type { DetectedDevice } from '@drizztdourden08/brock-input';
import { TOUCH_PAD_KEY } from '@rotp/input-mapping';
import { TOUCH_DEVICE_PRODUCT_ID, TOUCH_DEVICE_VENDOR_ID } from '@app/input/touch-pad/touch-device.constants';

const TOUCH_DEVICE: DetectedDevice = {
  id: TOUCH_PAD_KEY,
  type: 'gamepad',
  rawId: TOUCH_PAD_KEY,
  vendorId: TOUCH_DEVICE_VENDOR_ID,
  productId: TOUCH_DEVICE_PRODUCT_ID,
  deviceFamily: 'generic',
  displayName: 'Touch screen',
  sdlType: 'switch-pro',
  connected: true,
  activated: true,
  brandLogoKey: null,
  inputApi: 'webapi',
  hasRumble: false,
  hasGyro: false,
};

const TOUCH_EXTRA_DEVICES: readonly DetectedDevice[] = [TOUCH_DEVICE];

export { TOUCH_DEVICE, TOUCH_EXTRA_DEVICES };
