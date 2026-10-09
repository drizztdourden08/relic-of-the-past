/* @layer bridge-wasm @kind logic */
import type { StoryGateSetting } from '@shared/randomizer/world/story-gates/story-gate.type';
import { storyWordOf } from '@shared/randomizer/world/story-gates/story-gate-word';
import { setStoryHalf } from '../gate-word-5';
import { storyGatesState } from './story-gates-state';
import { storyWordNow } from './story-word-now';

const setSessionStoryGates = (setting: StoryGateSetting | null): void => {
  storyGatesState.sessionWord = setting === null ? null : storyWordOf(setting);
  setStoryHalf(storyWordNow());
};

export { setSessionStoryGates };
