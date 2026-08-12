/* @layer shared-input @kind types */
/** One segment of a vibration pattern: how long, and how hard. */
interface VibrationSegment {
  durationMs: number;
  intensity: number; // 0.0 - 1.0
}

export type { VibrationSegment };
