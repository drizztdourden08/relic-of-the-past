/* @layer renderer-lib @kind logic */
import { getHapticIntensityScale } from '@shared/input/haptics';
import { HAPTIC_PATTERNS } from '@shared/input/data/haptics';
import type { HapticPatternId } from '@shared/input/data/haptics';
import type { VibrateResult } from '@shared/platform';
import * as controllersStore from '../controllers-store';
import { shapeForDevice } from './shape-for-device';

const previewHapticPattern = (deviceKey: string, patternId: HapticPatternId): Promise<VibrateResult> => {
  const entry = HAPTIC_PATTERNS[patternId];
  const scale = getHapticIntensityScale();
  const scaled = entry.segments.map((seg) => ({ durationMs: seg.durationMs, intensity: Math.min(1, seg.intensity * scale) }));
  const shaped = shapeForDevice(deviceKey, scaled, entry.minDurationExempt);
  return controllersStore.vibratePattern(deviceKey, shaped, entry.gapMs ?? 0);
};

export { previewHapticPattern };
