/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../../progressive/progressive-families.constants';
import { DEFAULT_COPY_MULTIPLIER, MAX_HEART_CAP } from './difficulty.constants';
import type { DifficultySetting } from '../difficulty.type';

const isReferenceDifficulty = (setting: DifficultySetting): boolean =>
  setting.heartCap >= MAX_HEART_CAP
  && PROGRESSIVE_FAMILIES.every((family) => setting.copies[family.id] === DEFAULT_COPY_MULTIPLIER);

export { isReferenceDifficulty };
