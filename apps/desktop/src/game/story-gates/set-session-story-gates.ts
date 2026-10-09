/* @layer bridge-wasm @kind logic */
import type { StoryGateSetting } from '@rotp/randomizer';
import { storyWordOf, storyGatesState, storyWordNow } from '@rotp/randomizer';
import { setStoryHalf } from '../gate-word-5';

const setSessionStoryGates = (setting: StoryGateSetting | null): void => {
  storyGatesState.sessionWord = setting === null ? null : storyWordOf(setting);
  setStoryHalf(storyWordNow());
};

export { setSessionStoryGates };
