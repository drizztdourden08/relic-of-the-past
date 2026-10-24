/* @layer shared-input @kind types */
import type { VibrationSegment } from '../vibration-segment.type';
import type { SdlGamepadType } from './family.type';

interface ApplyVibrationShapingParams {
  readonly sdlType: SdlGamepadType;
  readonly pattern: readonly VibrationSegment[];
  readonly minDurationExempt?: boolean;
}

export type { ApplyVibrationShapingParams };
