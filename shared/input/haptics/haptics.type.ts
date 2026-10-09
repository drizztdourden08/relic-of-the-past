/* @layer shared-input @kind types */
import type { VibrationSegment } from '../vibration-segment.type';
import type { HapticSettings } from '../../types/settings';

type VibrateFunction = (pattern: VibrationSegment[], gapMs?: number, minDurationExempt?: boolean) => void;

type PickupPatternId = 'heartPiece' | 'pendantCrystal' | 'largeRupee';

interface HapticState {
  settings: HapticSettings;
  vibrateFn: VibrateFunction | null;
  lastDashPulseTime: number;
}

export type { HapticState, PickupPatternId, VibrateFunction };
