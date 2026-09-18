/* @layer bridge-wasm @kind logic */
/**
 * Arming the story gates: which half of gate word 5 the settings ask for, and which a seed
 * asks for while it runs. The word itself is derived in the shared module
 * (story-gates/story-gate-word.ts), so both sides fold a setting the same way.
 *
 * The default is the event reading, everywhere. A file with no seed arms every scene gate
 * and the ledger, and leaves the count gates at the original numbers. Vanilla Safe alone
 * forces the whole word to zero, which the core also enforces in its own parity mask. A
 * seed arms exactly its own choices; disarming hands the word back to the settings half.
 */

import { DEFAULT_STORY_WORD, storyWordOf } from '@shared/randomizer/ap-world/story-gates/story-gate-word';
import { setStoryHalf } from './gate-word-5';
import type { StoryGateSetting } from '@shared/randomizer/ap-world/story-gates/story-gate.type';

let settingsWord = DEFAULT_STORY_WORD;
let sessionWord: number | null = null;

const push = (): void => setStoryHalf(sessionWord ?? settingsWord);

/** The settings half: the defaults, or nothing at all under Vanilla Safe. */
const setSettingsStoryGates = (vanillaSafe: boolean): void => {
  settingsWord = vanillaSafe ? 0 : DEFAULT_STORY_WORD;
  push();
};

/** A seed's own choices replace the settings half while it runs; null hands the word back. */
const setSessionStoryGates = (setting: StoryGateSetting | null): void => {
  sessionWord = setting === null ? null : storyWordOf(setting);
  push();
};

const storyWordNow = (): number => sessionWord ?? settingsWord;

export { setSessionStoryGates, setSettingsStoryGates, storyWordNow };
