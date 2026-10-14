/* @layer renderer-components @kind logic */
import type { DetectedDevice } from '@rotp/input-mapping';
import { KEYBOARD_ICON } from './controls-settings.constants';
import type { RequiredInput } from './controls-settings.type';

const keyboardRequiredInput = (devices: DetectedDevice[]): RequiredInput => ({
  type: 'keyboard',
  label: 'Keyboard',
  iconSrc: KEYBOARD_ICON,
  connected: devices.some(d => d.type === 'keyboard' && d.connected),
});

export { keyboardRequiredInput };
