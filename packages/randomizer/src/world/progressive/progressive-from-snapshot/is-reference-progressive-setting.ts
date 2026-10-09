/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../progressive-families.constants';
import { defaultTickOf } from './default-tick-of';
import type { ProgressiveSetting } from '../progressive.type';

const isReferenceProgressiveSetting = (setting: ProgressiveSetting): boolean =>
  PROGRESSIVE_FAMILIES.every((family) => family.tiers.every((_tier, index) =>
    (setting[family.id][index] ?? defaultTickOf(family.id, index)) === defaultTickOf(family.id, index)));

export { isReferenceProgressiveSetting };
