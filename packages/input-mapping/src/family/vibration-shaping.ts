/* @layer shared-input @kind logic */
import type { VibrationSegment } from '../vibration-segment.type';
import { buildDisplayContext, resolveMinDurationMs, resolveShapeVibration } from './resolve-display';
import type { ApplyVibrationShapingParams } from './vibration-shaping.type';

const stretchToMinDuration = (pattern: VibrationSegment[], minDurationMs: number): VibrationSegment[] => {
  if (pattern.length === 0) return pattern;
  const total = pattern.reduce((sum, seg) => sum + seg.durationMs, 0);
  if (total >= minDurationMs) return pattern;
  const extra = minDurationMs - total;
  return pattern.map((seg, i) => (i === pattern.length - 1 ? { ...seg, durationMs: seg.durationMs + extra } : seg));
};

const applyVibrationShaping = (params: ApplyVibrationShapingParams): VibrationSegment[] => {
  const { sdlType, pattern, minDurationExempt } = params;
  const ctx = buildDisplayContext({ sdlType });
  const shapeVibration = resolveShapeVibration(ctx);
  const shaped = pattern.map((seg) => ({ durationMs: seg.durationMs, intensity: shapeVibration(seg.intensity) }));
  const minDurationMs = resolveMinDurationMs(ctx);
  if (minDurationMs <= 0 || minDurationExempt) return shaped;
  return stretchToMinDuration(shaped, minDurationMs);
};

export { applyVibrationShaping };
