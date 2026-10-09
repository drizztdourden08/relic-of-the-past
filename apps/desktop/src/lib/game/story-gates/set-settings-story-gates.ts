/* @layer bridge-wasm @kind logic */
import { DEFAULT_STORY_WORD } from '@rotp/randomizer';
import { setStoryHalf } from '../gate-word-5';
import { storyGatesState } from '@rotp/randomizer';
import { storyWordNow } from '@rotp/randomizer';

const setSettingsStoryGates = (vanillaSafe: boolean): void => {
  storyGatesState.settingsWord = vanillaSafe ? 0 : DEFAULT_STORY_WORD;
  setStoryHalf(storyWordNow());
};

export { setSettingsStoryGates };
