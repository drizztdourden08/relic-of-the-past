/* @layer shared-game @kind constants */
import type { CurvePreset } from './curves.type';

const CURVE_PRESETS: readonly CurvePreset[] = [
  { id: 'reference', label: 'Reference', curve: 'equal', countFor: (span) => span },
  { id: 'quick-start', label: 'Quick start', curve: 'front', countFor: (span) => Math.min(span, 4) },
  { id: 'slow-burn', label: 'Slow burn', curve: 'ramp', countFor: (span) => Math.min(span, 5) },
  {
    id: 'halves',
    label: 'Halves',
    curve: 'geometric',
    countFor: (span) => Math.max(1, Math.floor(Math.log2(span + 1))),
  },
];

export { CURVE_PRESETS };
