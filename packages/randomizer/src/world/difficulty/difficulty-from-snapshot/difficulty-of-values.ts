/* @layer shared-game @kind logic */
import { copiesOfValues } from './copies-of-values';
import { heartCapOfValues } from './heart-cap-of-values';
import type { OptionValues } from '../../options.type';
import type { DifficultySetting } from '../difficulty.type';

const difficultyOfValues = (values: OptionValues): DifficultySetting => ({
  copies: copiesOfValues(values),
  heartCap: heartCapOfValues(values),
});

export { difficultyOfValues };
