/* @layer renderer-lib @kind logic */
import type { DetectedDevice } from '@shared/types/controls/devices/devices.type';

const detectKeyboard = (index = 0): DetectedDevice => ({
  id: `keyboard-${index}`,
  type: 'keyboard',
  rawId: 'Standard Keyboard',
  vendorId: null,
  productId: null,
  deviceFamily: 'keyboard',
  displayName: 'Keyboard',
  sdlType: 'keyboard',
  connected: true,
  activated: true,
  brandLogoKey: 'keyboard',
  inputApi: 'webapi',
  hasRumble: false,
  hasGyro: false,
});

export { detectKeyboard };
