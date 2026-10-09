/* @layer renderer-lib @kind logic */
import { CURVE_PRESETS } from '@rotp/randomizer';
import type { CurvePreset, CurvePresetId } from '@rotp/randomizer';

const presetOfChoice = (choice: `preset:${CurvePresetId}`): CurvePreset => {
  const id = choice.slice('preset:'.length) as CurvePresetId;
  return CURVE_PRESETS.find((candidate) => candidate.id === id) ?? CURVE_PRESETS[0];
};

export { presetOfChoice };
