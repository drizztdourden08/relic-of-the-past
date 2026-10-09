/* @layer shared-game @kind logic */
import { progressiveModesOfValues } from './progressive-modes-of-values';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { ProgressiveModeSetting } from '../progressive.type';

const progressiveModesFromSnapshot = (snapshot: RandomizerOptionsSnapshot): ProgressiveModeSetting =>
  progressiveModesOfValues(snapshot.values);

export { progressiveModesFromSnapshot };
