/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { DetectedDevice } from '@drizztdourden08/brock-input';
import { TOUCH_PAD_KEY } from '@rotp/input-mapping';
import { TOUCH_DEVICE_PRODUCT_ID, TOUCH_DEVICE_VENDOR_ID } from '@app/input/touch-pad/touch-device.constants';

const touchDevice = (t: I18n['t']): DetectedDevice => ({
  id: TOUCH_PAD_KEY,
  type: 'gamepad',
  rawId: TOUCH_PAD_KEY,
  vendorId: TOUCH_DEVICE_VENDOR_ID,
  productId: TOUCH_DEVICE_PRODUCT_ID,
  deviceFamily: 'generic',
  displayName: t('profiles:controls.touch-device'),
  sdlType: 'switch-pro',
  connected: true,
  activated: true,
  brandLogoKey: null,
  inputApi: 'webapi',
  hasRumble: false,
  hasGyro: false,
});

const touchExtraDevices = (t: I18n['t']): readonly DetectedDevice[] => [touchDevice(t)];

export { touchExtraDevices };
