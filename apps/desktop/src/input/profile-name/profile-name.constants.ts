/* @layer renderer-app @kind constants */
import { KEYBOARD_DEFAULT } from '@rotp/input-mapping';

const KEYBOARD_PROFILE_IDS: readonly string[] = [KEYBOARD_DEFAULT.id, `default-${KEYBOARD_DEFAULT.id}`];

export { KEYBOARD_PROFILE_IDS };
