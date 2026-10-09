/* @layer renderer-lib @kind logic */
import type { VibrationSegment } from '@shared/input/vibration-segment.type';
import { getInputManager } from '../input-manager';
import * as controllersStore from '../controllers-store';
import { hapticState } from './haptic-state';
import { shapeForDevice } from './shape-for-device';

const deviceHapticsEnabled = (deviceKey: string): boolean =>
  hapticState.profileEnabled && getInputManager().allowed.gamepadKeys.has(deviceKey);

const sendToController = (pattern: VibrationSegment[], gapMs?: number, minDurationExempt?: boolean): void => {
  const gap = gapMs ?? 0;
  const manager = getInputManager();

  for (const key of manager.allowed.gamepadKeys) {
    if (!deviceHapticsEnabled(key)) continue;
    const entry = manager.hidDeviceCache.find((d) => d.deviceKey === key);
    if (!entry || entry.status !== 'ready') continue;
    const shaped = shapeForDevice(key, pattern, minDurationExempt);
    controllersStore.vibratePattern(key, shaped, gap);
  }
};

export { sendToController };
