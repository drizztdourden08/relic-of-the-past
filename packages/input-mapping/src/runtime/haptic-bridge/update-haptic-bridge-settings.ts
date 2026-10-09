/* @layer renderer-lib @kind logic */
import { updateHapticSettings } from '../../haptics';
import type { HapticSettings } from '../../haptics';

const updateHapticBridgeSettings = (settings: HapticSettings): void => {
  updateHapticSettings(settings);
};

export { updateHapticBridgeSettings };
