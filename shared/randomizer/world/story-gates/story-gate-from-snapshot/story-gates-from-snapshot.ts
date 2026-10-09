/* @layer shared-game @kind logic */
import { storyGatesOfValues } from './story-gates-of-values';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { StoryGateSetting } from '../story-gate.type';

const storyGatesFromSnapshot = (snapshot: RandomizerOptionsSnapshot): StoryGateSetting =>
  storyGatesOfValues(snapshot.values);

export { storyGatesFromSnapshot };
