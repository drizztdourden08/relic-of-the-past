/* @layer shared-game @kind logic */
import { retroBowOfValues } from './retro-bow-of-values';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { RetroBowSetting } from '../retro.type';

const retroBowFromSnapshot = (snapshot: RandomizerOptionsSnapshot): RetroBowSetting =>
  retroBowOfValues(snapshot.values);

export { retroBowFromSnapshot };
