/* @layer bridge-wasm @kind logic */
import { DEFAULT_STORY_WORD } from '@shared/randomizer/world/story-gates/story-gate-word';
import { setStoryHalf } from '../gate-word-5';
import { storyGatesState } from './story-gates-state';
import { storyWordNow } from './story-word-now';

const setSettingsStoryGates = (vanillaSafe: boolean): void => {
  storyGatesState.settingsWord = vanillaSafe ? 0 : DEFAULT_STORY_WORD;
  setStoryHalf(storyWordNow());
};

export { setSettingsStoryGates };
