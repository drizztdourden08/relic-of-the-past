/* @layer shared-game @kind constants */
import { NO_BYTES } from './native-table-fallbacks.constants';
import { pickNativeTable } from './pick-native-table';

const ROOM_TAG_NAMES = pickNativeTable<Readonly<Record<number, string>>>('ROOM_TAG_NAMES', NO_BYTES);
const MANIPULABLE_NAMES = pickNativeTable<Readonly<Record<number, string>>>('MANIPULABLE_NAMES', NO_BYTES);

export { MANIPULABLE_NAMES, ROOM_TAG_NAMES };
