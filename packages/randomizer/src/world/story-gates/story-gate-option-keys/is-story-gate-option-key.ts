/* @layer shared-game @kind logic */
import { STORY_GATE_KEY_SET } from './story-gate-option-keys.constants';

const isStoryGateOptionKey = (key: string): boolean => STORY_GATE_KEY_SET.has(key);

export { isStoryGateOptionKey };
