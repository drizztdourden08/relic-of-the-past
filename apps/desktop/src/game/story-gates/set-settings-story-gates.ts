/* @layer bridge-wasm @kind logic */
import { DEFAULT_STORY_WORD, storyGatesState, storyWordNow } from '@rotp/randomizer';
import { setStoryHalf } from '../gate-word-5';

const setSettingsStoryGates = (vanillaSafe: boolean): void => {
  storyGatesState.settingsWord = vanillaSafe ? 0 : DEFAULT_STORY_WORD;
  setStoryHalf(storyWordNow());
};

export { setSettingsStoryGates };
