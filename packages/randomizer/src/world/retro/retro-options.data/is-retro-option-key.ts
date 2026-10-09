/* @layer shared-game @kind logic */
import { RETRO_OPTION_KEYS } from './retro-options.data';

const isRetroOptionKey = (key: string): boolean => RETRO_OPTION_KEYS.includes(key);

export { isRetroOptionKey };
