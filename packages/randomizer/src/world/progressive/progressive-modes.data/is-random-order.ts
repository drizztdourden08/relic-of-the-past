/* @layer shared-game @kind logic */
import type { ProgressiveFamilyId, ProgressiveModeSetting } from '../progressive.type';

const isRandomOrder = (modes: ProgressiveModeSetting, family: ProgressiveFamilyId): boolean =>
  modes[family] === 'random';

export { isRandomOrder };
