/* @layer shared-game @kind constants */
import { DARK_ROOM_LIGHT_FIELDS } from '../dark-room-lights.constants';
import { darkRoomLightKeyOf } from './dark-room-light-key-of';
import { DARK_ROOM_REQUIRED_KEY } from './dark-room-option-keys.constants';

const DARK_ROOM_LIGHT_KEYS: readonly string[] = DARK_ROOM_LIGHT_FIELDS.map(darkRoomLightKeyOf);

const DARK_ROOM_OPTION_KEYS: readonly string[] = [DARK_ROOM_REQUIRED_KEY, ...DARK_ROOM_LIGHT_KEYS];

const DARK_ROOM_KEY_SET: ReadonlySet<string> = new Set(DARK_ROOM_OPTION_KEYS);

export { DARK_ROOM_KEY_SET, DARK_ROOM_LIGHT_KEYS, DARK_ROOM_OPTION_KEYS };
