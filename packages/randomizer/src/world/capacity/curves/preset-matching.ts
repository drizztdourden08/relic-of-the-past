/* @layer shared-game @kind logic */
import { CURVE_PRESETS } from './curve-presets.constants';
import type { CurveId } from '../capacity-profile.type';
import type { CurvePreset } from './curves.type';

const presetMatching = (curve: CurveId | 'free', count: number, span: number): CurvePreset | undefined =>
  CURVE_PRESETS.find((preset) => preset.curve === curve && preset.countFor(span) === count);

export { presetMatching };
