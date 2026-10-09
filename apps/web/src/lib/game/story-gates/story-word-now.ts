/* @layer bridge-wasm @kind logic */
import { storyGatesState } from './story-gates-state';

const storyWordNow = (): number => storyGatesState.sessionWord ?? storyGatesState.settingsWord;

export { storyWordNow };
