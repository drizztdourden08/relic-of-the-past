/* @layer shared-game @kind types */
import type { CurveId } from '../capacity-profile.type';

type Proportions = (n: number) => readonly number[];

type CurvePresetId = 'reference' | 'quick-start' | 'slow-burn' | 'halves';

interface CurvePreset {
  id: CurvePresetId;
  label: string;
  curve: CurveId;
  countFor: (span: number) => number;
}

export type { CurvePreset, CurvePresetId, Proportions };
