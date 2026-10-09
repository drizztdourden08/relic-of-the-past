/* @layer renderer-lib @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import type { VibrateResult } from '@drizztdourden08/brock-input';
import { getHapticIntensityScale } from '@shared/input/haptics';
import { HAPTIC_PATTERNS } from '@shared/input/data/haptics';
import type { HapticPatternId } from '@shared/input/data/haptics';
import { shapeForDevice } from './shape-for-device';
import { INPUT_UNAVAILABLE } from './haptic-bridge.constants';

const previewHapticPattern = (deviceKey: string, patternId: HapticPatternId): Promise<VibrateResult> => {
  const entry = HAPTIC_PATTERNS[patternId];
  const scale = getHapticIntensityScale();
  const scaled = entry.segments.map((seg) => ({ durationMs: seg.durationMs, intensity: Math.min(1, seg.intensity * scale) }));
  const shaped = shapeForDevice(deviceKey, scaled, entry.minDurationExempt);
  return inputApi()?.vibratePattern(deviceKey, shaped, entry.gapMs ?? 0) ?? Promise.resolve(INPUT_UNAVAILABLE);
};

export { previewHapticPattern };
