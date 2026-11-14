/* @layer renderer-lib @kind logic */
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import { TOUCH_DEVICE_ENTRY } from '@rotp/input-mapping';
import { touchPadAllowed } from './touch-pad-allowed';

const withTouchDevice = (devices: readonly DeviceEntry[]): readonly DeviceEntry[] =>
  touchPadAllowed() ? [...devices, TOUCH_DEVICE_ENTRY] : devices;

export { withTouchDevice };
