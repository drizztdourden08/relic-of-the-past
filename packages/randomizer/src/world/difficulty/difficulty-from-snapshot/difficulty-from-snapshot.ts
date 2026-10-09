/* @layer shared-game @kind logic */
import { difficultyOfValues } from './difficulty-of-values';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { DifficultySetting } from '../difficulty.type';

const difficultyFromSnapshot = (snapshot: RandomizerOptionsSnapshot): DifficultySetting =>
  difficultyOfValues(snapshot.values);

export { difficultyFromSnapshot };
