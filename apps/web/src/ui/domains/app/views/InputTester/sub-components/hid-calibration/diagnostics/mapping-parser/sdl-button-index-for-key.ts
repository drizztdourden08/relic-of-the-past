/* @layer renderer-components @kind logic */
import { BUTTON_KEYS } from './mapping-parser.constants';

const sdlButtonIndexForKey = (key: string): number => BUTTON_KEYS.indexOf(key as (typeof BUTTON_KEYS)[number]);

export { sdlButtonIndexForKey };
