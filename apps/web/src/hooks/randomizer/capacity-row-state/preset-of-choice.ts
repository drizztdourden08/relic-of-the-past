/* @layer renderer-lib @kind logic */
import { CURVE_PRESETS } from '@shared/randomizer/world/capacity';
import type { CurvePreset, CurvePresetId } from '@shared/randomizer/world/capacity';

const presetOfChoice = (choice: `preset:${CurvePresetId}`): CurvePreset => {
  const id = choice.slice('preset:'.length) as CurvePresetId;
  return CURVE_PRESETS.find((candidate) => candidate.id === id) ?? CURVE_PRESETS[0];
};

export { presetOfChoice };
