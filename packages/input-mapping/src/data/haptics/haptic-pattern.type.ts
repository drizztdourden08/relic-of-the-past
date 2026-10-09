/* @layer shared-input @kind types */
import type { VibrationSegment } from '../../vibration-segment.type';
import type { HAPTIC_PATTERN_RECIPES } from './haptic-pattern-recipes.data';

type VibrationShape =
  | { readonly kind: 'pulse' | 'doubleTap' | 'crescendo' | 'fadeOut'; readonly durationMs: number; readonly intensity: number }
  | { readonly kind: 'segments'; readonly segments: VibrationSegment[] };

interface HapticPatternTiming {
  gapMs?: number;
  delayMs?: number;
  cooldownMs?: number;
  minDurationExempt?: boolean;
}

interface HapticPatternRecipe extends HapticPatternTiming {
  shape: VibrationShape;
}

interface HapticPatternEntry extends HapticPatternTiming {
  segments: VibrationSegment[];
}

type HapticPatternId = keyof typeof HAPTIC_PATTERN_RECIPES;

export type { HapticPatternEntry, HapticPatternId, HapticPatternRecipe, HapticPatternTiming, VibrationShape };
