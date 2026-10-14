/* @layer shared-game @kind logic */
import { PROGRESSIVE_FAMILIES } from '../../progressive/progressive-families.constants';
import { HEART_CAP_KEY, difficultyCopiesKeyOf } from '../difficulty-option-keys';
import type { OptionValue } from '../../options.type';
import type { DifficultySetting } from '../difficulty.type';

const difficultyValuesOf = (setting: Partial<DifficultySetting> | undefined): Record<string, OptionValue> => ({
  ...Object.fromEntries(PROGRESSIVE_FAMILIES.map((family): [string, OptionValue] =>
    [difficultyCopiesKeyOf(family.id), setting?.copies?.[family.id] as OptionValue])),
  [HEART_CAP_KEY]: setting?.heartCap as OptionValue,
});

export { difficultyValuesOf };
