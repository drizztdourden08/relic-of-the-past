/* @layer shared-input @kind logic */
/**
 * Single decision point for a device's final vibration segments: the family's
 * strength curve, the user's per-device amplification override, and (when the
 * family needs one) a minimum-duration floor for a motor that cannot spin up
 * in a pattern's originally-authored duration. Every send-to-controller path
 * goes through this, so amplitude and duration are only ever decided here.
 */
import type { VibrationSegment } from '../vibration-segment.type';
import { buildDisplayContext } from './resolve-display';
import { resolveMinDurationMs, resolveShapeVibration } from './resolve-display';
import { applyRumbleStrength, getCachedRumbleStrength } from '../haptics-rumble-strength';
import type { SdlGamepadType } from './family.type';

/** Stretches only the last segment so the pattern's total duration reaches the
 *  floor; every other segment and every intensity is untouched. A pattern
 *  already at or past the floor is returned as-is. */
const stretchToMinDuration = (pattern: VibrationSegment[], minDurationMs: number): VibrationSegment[] => {
  if (pattern.length === 0) return pattern;
  const total = pattern.reduce((sum, seg) => sum + seg.durationMs, 0);
  if (total >= minDurationMs) return pattern;
  const extra = minDurationMs - total;
  return pattern.map((seg, i) => (i === pattern.length - 1 ? { ...seg, durationMs: seg.durationMs + extra } : seg));
};

interface ApplyVibrationShapingParams {
  readonly sdlType: SdlGamepadType;
  readonly deviceKey: string;
  readonly pattern: readonly VibrationSegment[];
  /** A rhythmic/polled pattern (e.g. a per-step dash pulse) opts out of the
   *  duration floor, since stretching every repeat would turn distinct taps
   *  into one continuous buzz. See HapticPatternEntry.minDurationExempt. */
  readonly minDurationExempt?: boolean;
}

const applyVibrationShaping = (params: ApplyVibrationShapingParams): VibrationSegment[] => {
  const { sdlType, deviceKey, pattern, minDurationExempt } = params;
  const ctx = buildDisplayContext({ sdlType });
  const shapeVibration = resolveShapeVibration(ctx);
  const strength = getCachedRumbleStrength(deviceKey);
  const shaped = pattern.map((seg) => ({
    durationMs: seg.durationMs,
    intensity: applyRumbleStrength(shapeVibration(seg.intensity), strength),
  }));
  const minDurationMs = resolveMinDurationMs(ctx);
  if (minDurationMs <= 0 || minDurationExempt) return shaped;
  return stretchToMinDuration(shaped, minDurationMs);
};

export { applyVibrationShaping };
