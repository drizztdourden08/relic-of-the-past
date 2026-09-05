/* @layer shared-input @kind data */
/**
 * Helper builders for haptic vibration segments. Intensity guide:
 *   0.10-0.20  very faint (ambient)
 *   0.20-0.35  faint (footsteps, small clicks)
 *   0.35-0.55  medium (sword swing, item use)
 *   0.55-0.75  strong (damage, hammer, explosions)
 *   0.75-1.00  heavy (death, boss defeat, quake)
 */

import type { VibrationSegment } from '../../vibration-segment.type';

const pulse = (durationMs: number, intensity: number): VibrationSegment[] => {
  return [{ durationMs, intensity }];
};

const doubleTap = (durationMs: number, intensity: number): VibrationSegment[] => {
  const half = Math.floor(durationMs / 2);
  return [{ durationMs: half, intensity }, { durationMs: half, intensity }];
};

const crescendo = (durationMs: number, maxIntensity: number, steps = 4): VibrationSegment[] => {
  const stepDuration = Math.floor(durationMs / steps);
  return Array.from({ length: steps }, (_, i) => ({
    durationMs: stepDuration,
    intensity: (maxIntensity / steps) * (i + 1),
  }));
};

const fadeOut = (durationMs: number, startIntensity: number, steps = 4): VibrationSegment[] => {
  const stepDuration = Math.floor(durationMs / steps);
  return Array.from({ length: steps }, (_, i) => ({
    durationMs: stepDuration,
    intensity: startIntensity * (1 - i / steps),
  }));
};

export { pulse, doubleTap, crescendo, fadeOut };
