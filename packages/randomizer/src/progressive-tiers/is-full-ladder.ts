/* @layer bridge-wasm @kind logic */
import type { ProgressiveModeSetting, ProgressiveSetting } from '../world/progressive/progressive.type';
import { DEFAULT_PROGRESSIVE_SETTING, PROGRESSIVE_FAMILIES } from '../world/progressive/progressive-families.data';
import { DEFAULT_PROGRESSIVE_MODES, isRandomOrder } from '../world/progressive/progressive-modes.data';

const isFullLadder = (
  setting: ProgressiveSetting, modes: ProgressiveModeSetting = DEFAULT_PROGRESSIVE_MODES,
): boolean =>
  PROGRESSIVE_FAMILIES.every((family) =>
    !isRandomOrder(modes, family.id)
    && family.tiers.every((_tier, index) =>
      (setting[family.id][index] ?? true) === (DEFAULT_PROGRESSIVE_SETTING[family.id][index] ?? true)));

export { isFullLadder };
