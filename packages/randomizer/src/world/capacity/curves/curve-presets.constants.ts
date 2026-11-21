/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { CurvePreset } from './curves.type';

const CURVE_PRESETS: readonly CurvePreset[] = [
  { id: 'reference', label: msg('randomizer:curvePreset.reference'), curve: 'equal', countFor: (span) => span },
  { id: 'quick-start', label: msg('randomizer:curvePreset.quickStart'), curve: 'front', countFor: (span) => Math.min(span, 4) },
  { id: 'slow-burn', label: msg('randomizer:curvePreset.slowBurn'), curve: 'ramp', countFor: (span) => Math.min(span, 5) },
  {
    id: 'halves',
    label: msg('randomizer:curvePreset.halves'),
    curve: 'geometric',
    countFor: (span) => Math.max(1, Math.floor(Math.log2(span + 1))),
  },
];

export { CURVE_PRESETS };
