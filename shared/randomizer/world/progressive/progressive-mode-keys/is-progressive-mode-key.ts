/* @layer shared-game @kind logic */
import { PROGRESSIVE_MODE_KEY_SET } from './progressive-mode-keys.constants';

const isProgressiveModeKey = (key: string): boolean => PROGRESSIVE_MODE_KEY_SET.has(key);

export { isProgressiveModeKey };
