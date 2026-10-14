/* @layer renderer-lib @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import type { VibrateResult } from '@drizztdourden08/brock-input';
import { getHapticIntensityScale, HAPTIC_PATTERNS, shapeForDevice } from '@rotp/input-mapping';
import type { HapticPatternId } from '@rotp/input-mapping';

const previewHapticPattern = (deviceKey: string, patternId: HapticPatternId): Promise<VibrateResult> => {
  const entry = HAPTIC_PATTERNS[patternId];
  const scale = getHapticIntensityScale();
  const scaled = entry.segments.map((seg) => ({ durationMs: seg.durationMs, intensity: Math.min(1, seg.intensity * scale) }));
  const shaped = shapeForDevice(deviceKey, scaled, entry.minDurationExempt);
  return inputApi().vibratePattern(deviceKey, shaped, entry.gapMs ?? 0);
};

export { previewHapticPattern };
