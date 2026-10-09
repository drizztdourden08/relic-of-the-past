/* @layer shared-game @kind constants */
import { NO_BYTES } from './native-table-fallbacks.constants';
import { pickNativeTable } from './pick-native-table';

const ROOM_TAG_NAMES = pickNativeTable<Readonly<Record<number, string>>>('ROOM_TAG_NAMES', NO_BYTES);
const LAYER_EFFECT_NAMES = pickNativeTable<readonly string[]>('LAYER_EFFECT_NAMES', []);
const COLLISION_MODE_NAMES = pickNativeTable<readonly string[]>('COLLISION_MODE_NAMES', []);
const MANIPULABLE_NAMES = pickNativeTable<Readonly<Record<number, string>>>('MANIPULABLE_NAMES', NO_BYTES);

export { COLLISION_MODE_NAMES, LAYER_EFFECT_NAMES, MANIPULABLE_NAMES, ROOM_TAG_NAMES };
