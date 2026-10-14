/* @layer renderer-lib @kind logic */
import type { VibrationSegment } from '@rotp/input-mapping';
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { hapticState, shapeForDevice } from '@rotp/input-mapping';

const deviceHapticsEnabled = (deviceKey: string): boolean =>
  hapticState.profileEnabled && getInputManager().allowed.gamepadKeys.has(deviceKey);

const sendToController = (pattern: VibrationSegment[], gapMs?: number, minDurationExempt?: boolean): void => {
  const gap = gapMs ?? 0;
  const manager = getInputManager();

  for (const key of manager.allowed.gamepadKeys) {
    if (!deviceHapticsEnabled(key)) continue;
    const entry = manager.hidDeviceCache.find((d) => d.deviceKey === key);
    if (entry?.status !== 'ready') continue;
    const shaped = shapeForDevice(key, pattern, minDurationExempt);
    void inputApi().vibratePattern(key, shaped, gap);
  }
};

export { sendToController };
