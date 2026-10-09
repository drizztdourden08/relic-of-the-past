/* @layer shared-input @kind logic */
import { HAPTIC_PATTERNS } from '../data/haptics';
import type { HapticPatternEntry, HapticPatternId } from '../data/haptics';
import type { VibrationSegment } from '../vibration-segment.type';
import { checkCooldown } from './check-cooldown';
import { hapticState } from './haptic-state';

const scalePattern = (segments: VibrationSegment[]): VibrationSegment[] => {
  const scale = hapticState.settings.intensity / 100;
  return segments.map(seg => ({
    durationMs: seg.durationMs,
    intensity: Math.min(1.0, seg.intensity * scale),
  }));
};

const firePattern = (patternId: HapticPatternId): void => {
  const { vibrateFn } = hapticState;
  if (!vibrateFn || !hapticState.settings.enabled) return;

  const entry: HapticPatternEntry = HAPTIC_PATTERNS[patternId];
  if (!entry) return;

  if (entry.cooldownMs && !checkCooldown(patternId, entry.cooldownMs)) return;

  const scaled = scalePattern(entry.segments);
  const gapMs = entry.gapMs ?? 0;
  const minDurationExempt = entry.minDurationExempt ?? false;

  if (entry.delayMs && entry.delayMs > 0) {
    setTimeout(() => {
      if (hapticState.vibrateFn && hapticState.settings.enabled) {
        hapticState.vibrateFn(scaled, gapMs, minDurationExempt);
      }
    }, entry.delayMs);
  } else {
    vibrateFn(scaled, gapMs, minDurationExempt);
  }
};

export { firePattern };
