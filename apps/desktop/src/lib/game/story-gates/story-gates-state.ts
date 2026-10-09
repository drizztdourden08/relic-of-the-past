/* @layer bridge-wasm @kind logic */
import { DEFAULT_STORY_WORD } from '@shared/randomizer/world/story-gates/story-gate-word';

const storyGatesState = {
  settingsWord: DEFAULT_STORY_WORD,
  sessionWord: null as number | null,
};

export { storyGatesState };
