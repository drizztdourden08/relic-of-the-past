/* @layer shared-input @kind logic */
import { SHAPE_STEPS } from './haptic-shape.constants';
import type { VibrationSegment } from '../../vibration-segment.type';
import type { VibrationShape } from './haptic-pattern.type';

const pulse = (durationMs: number, intensity: number): VibrationSegment[] => {
  return [{ durationMs, intensity }];
};

const doubleTap = (durationMs: number, intensity: number): VibrationSegment[] => {
  const half = Math.floor(durationMs / 2);
  return [{ durationMs: half, intensity }, { durationMs: half, intensity }];
};

const crescendo = (durationMs: number, maxIntensity: number, steps = SHAPE_STEPS): VibrationSegment[] => {
  const stepDuration = Math.floor(durationMs / steps);
  return Array.from({ length: steps }, (_, i) => ({
    durationMs: stepDuration,
    intensity: (maxIntensity / steps) * (i + 1),
  }));
};

const fadeOut = (durationMs: number, startIntensity: number, steps = SHAPE_STEPS): VibrationSegment[] => {
  const stepDuration = Math.floor(durationMs / steps);
  return Array.from({ length: steps }, (_, i) => ({
    durationMs: stepDuration,
    intensity: startIntensity * (1 - i / steps),
  }));
};

const buildSegments = (shape: VibrationShape): VibrationSegment[] => {
  switch (shape.kind) {
    case 'pulse': return pulse(shape.durationMs, shape.intensity);
    case 'doubleTap': return doubleTap(shape.durationMs, shape.intensity);
    case 'crescendo': return crescendo(shape.durationMs, shape.intensity);
    case 'fadeOut': return fadeOut(shape.durationMs, shape.intensity);
    case 'segments': return shape.segments;
  }
};

export { buildSegments };
