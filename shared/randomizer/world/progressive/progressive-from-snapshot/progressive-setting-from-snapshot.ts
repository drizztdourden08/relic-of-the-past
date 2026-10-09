/* @layer shared-game @kind logic */
import { progressiveSettingOfValues } from './progressive-setting-of-values';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { ProgressiveSetting } from '../progressive.type';

const progressiveSettingFromSnapshot = (snapshot: RandomizerOptionsSnapshot): ProgressiveSetting =>
  progressiveSettingOfValues(snapshot.values);

export { progressiveSettingFromSnapshot };
