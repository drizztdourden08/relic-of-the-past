/* @layer shared-input @kind data */
/**
 * Haptic pattern entry type — shared by all category chunks.
 */

import type { VibrationSegment } from '../../base';

interface HapticPatternEntry {
  /** Vibration segments: array of { durationMs, intensity } */
  segments: VibrationSegment[];
  /** Gap in ms between segments when played sequentially (default: 0) */
  gapMs?: number;
  /** Delay in ms before the pattern starts, for animation/sound sync (default: 0) */
  delayMs?: number;
  /** Minimum ms between repeated triggers of this event (debounce). 0 = no limit. */
  cooldownMs?: number;
}

export type { HapticPatternEntry };
