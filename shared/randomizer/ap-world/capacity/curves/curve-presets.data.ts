/* @layer shared-game @kind data */
/**
 * Named generator configurations. A preset is { curve, countFor(span) }:
 * selecting one writes curve + count into the setting and nothing else is
 * stored, so a preset can never drift from what it produced. The panel
 * shows a preset's name whenever (curve, count) equals what it would write;
 * editing either detaches it.
 */
import type { CurveId } from '../capacity-profile.type';

type CurvePresetId = 'reference' | 'quick-start' | 'slow-burn' | 'halves';

interface CurvePreset {
  id: CurvePresetId;
  label: string;
  curve: CurveId;
  countFor: (span: number) => number;
}

const CURVE_PRESETS: readonly CurvePreset[] = [
  // One tier per item — the reference ladder, exact. Hidden on the wallet (no reference ladder).
  { id: 'reference', label: 'Reference', curve: 'equal', countFor: (span) => span },
  { id: 'quick-start', label: 'Quick start', curve: 'front', countFor: (span) => Math.min(span, 4) },
  { id: 'slow-burn', label: 'Slow burn', curve: 'ramp', countFor: (span) => Math.min(span, 5) },
  // 1 2 4 … fits exactly when span = 2^k − 1.
  {
    id: 'halves',
    label: 'Halves',
    curve: 'geometric',
    countFor: (span) => Math.max(1, Math.floor(Math.log2(span + 1))),
  },
];

/** The preset whose (curve, count) is exactly this setting, if any. */
const presetMatching = (curve: CurveId | 'free', count: number, span: number): CurvePreset | undefined =>
  CURVE_PRESETS.find((preset) => preset.curve === curve && preset.countFor(span) === count);

export { CURVE_PRESETS, presetMatching };
export type { CurvePreset, CurvePresetId };
