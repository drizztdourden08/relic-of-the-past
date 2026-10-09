/* @layer renderer-lib @kind logic */
import { updateHapticSettings } from '@shared/input/haptics';
import type { HapticSettings } from '@shared/input/haptics';

const updateHapticBridgeSettings = (settings: HapticSettings): void => {
  updateHapticSettings(settings);
};

export { updateHapticBridgeSettings };
