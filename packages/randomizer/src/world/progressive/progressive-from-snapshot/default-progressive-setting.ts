/* @layer shared-game @kind logic */
import { DEFAULT_PROGRESSIVE_SETTING, PROGRESSIVE_FAMILIES } from '../progressive-families.constants';
import type { ProgressiveSetting, ProgressiveTierTicks } from '../progressive.type';

const defaultProgressiveSetting = (): ProgressiveSetting =>
  Object.fromEntries(PROGRESSIVE_FAMILIES.map((family) => [
    family.id, [...(DEFAULT_PROGRESSIVE_SETTING[family.id])],
  ])) as unknown as ProgressiveSetting;

export { defaultProgressiveSetting };
