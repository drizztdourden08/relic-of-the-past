/* @layer shared-game @kind constants */
import type { DarkRoomLightField } from './dark-room.type';

const LIGHTS_BEHIND_WORLD_SHUFFLE: readonly DarkRoomLightField[] = ['bombos'];

const WORLD_SHUFFLE_REASON = 'is off until standing world items are shuffled';

export { LIGHTS_BEHIND_WORLD_SHUFFLE, WORLD_SHUFFLE_REASON };
