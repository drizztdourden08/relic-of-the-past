/* @layer renderer-lib @kind logic */
import type { VibrationSegment } from '@rotp/input-mapping';
import { getPlatform } from '@drizztdourden08/brock-react';
import { HID_WORKER_OVERHEAD_MS, hapticState } from '@rotp/input-mapping';
import { sendToController } from './send-to-controller';

const scheduleDecay = (ms: number): void => {
  if (hapticState.decayTimer !== null) clearTimeout(hapticState.decayTimer);
  hapticState.decayTimer = setTimeout(() => {
    hapticState.activeIntensity = 0;
    hapticState.activeUntil = 0;
    hapticState.decayTimer = null;
  }, ms);
};

const envelopeOf = (pattern: VibrationSegment[], gapMs?: number): { peak: number; duration: number } => {
  let peak = 0;
  let duration = 0;
  for (const seg of pattern) {
    if (seg.intensity > peak) peak = seg.intensity;
    duration += seg.durationMs;
  }
  if (gapMs && pattern.length > 1) duration += gapMs * (pattern.length - 1);
  return { peak, duration };
};

const dispatchVibration = (pattern: VibrationSegment[], gapMs?: number, minDurationExempt?: boolean): void => {
  const now = performance.now();
  hapticState.counts.events++;

  const { peak, duration } = envelopeOf(pattern, gapMs);
  const effectiveDuration = duration + HID_WORKER_OVERHEAD_MS;

  const motorOff = now >= hapticState.activeUntil;
  const stronger = peak > hapticState.activeIntensity;

  if (motorOff || stronger) {
    hapticState.counts.dispatched++;
    sendToController(pattern, gapMs, minDurationExempt);
    getPlatform().device.vibrate(duration);
    hapticState.activeIntensity = peak;
    hapticState.activeUntil = now + effectiveDuration;
    scheduleDecay(effectiveDuration);
  } else {
    hapticState.counts.merged++;
  }
};

export { dispatchVibration };
