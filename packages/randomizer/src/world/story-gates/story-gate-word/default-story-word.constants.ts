/* @layer shared-game @kind constants */
import { DEFAULT_STORY_GATES } from '../story-gates.data';
import { storyWordOf } from './story-word-of';

const DEFAULT_STORY_WORD = storyWordOf(DEFAULT_STORY_GATES);

export { DEFAULT_STORY_WORD };
