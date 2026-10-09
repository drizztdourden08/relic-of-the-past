/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../progressive-families.data';
import type { ProgressiveModeSetting } from '../progressive.type';

const isReferenceProgressiveModes = (modes: ProgressiveModeSetting): boolean =>
  PROGRESSIVE_FAMILIES.every((family) => modes[family.id] !== 'random');

export { isReferenceProgressiveModes };
