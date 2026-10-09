/* @layer renderer-components @kind logic */
import { AXIS_KEYS } from './mapping-parser.constants';

const sdlAxisIndexForKey = (key: string): number => AXIS_KEYS.indexOf(key as (typeof AXIS_KEYS)[number]);

export { sdlAxisIndexForKey };
