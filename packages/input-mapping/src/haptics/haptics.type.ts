/* @layer shared-input @kind types */
import type { HapticPatternId } from '../data/haptics';
import type { VibrationSegment } from '../vibration-segment.type';
import type { HapticSettings } from '@rotp/features';

type VibrateFunction = (pattern: VibrationSegment[], gapMs?: number, minDurationExempt?: boolean) => void;

type HapticRoute = {
  setting: 'swordSwing' | 'swordHitEnemy' | 'swordClink' | 'damageTaken' | 'itemUse' | 'environmentalEffects';
  pattern: (param: number) => HapticPatternId | null;
};

type PickupPatternId = 'heartPiece' | 'pendantCrystal' | 'largeRupee';

interface HapticState {
  settings: HapticSettings;
  vibrateFn: VibrateFunction | null;
  lastDashPulseTime: number;
}

export type { HapticRoute, HapticState, PickupPatternId, VibrateFunction };
