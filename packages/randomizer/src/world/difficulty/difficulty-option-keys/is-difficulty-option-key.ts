/* @layer shared-game @kind logic */
import { DIFFICULTY_OPTION_KEY_SET } from './difficulty-key-lists.constants';

const isDifficultyOptionKey = (key: string): boolean => DIFFICULTY_OPTION_KEY_SET.has(key);

export { isDifficultyOptionKey };
