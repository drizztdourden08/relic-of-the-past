/* @layer renderer-components @kind constants */
import { KEYBOARD_DEFAULT } from '@rotp/input-mapping';
import { toBrockMappings } from './to-brock-mappings';

const KEYBOARD_DEFAULTS = toBrockMappings(KEYBOARD_DEFAULT.defaultMappings);

export { KEYBOARD_DEFAULTS };
