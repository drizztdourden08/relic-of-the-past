/* @layer shared-game @kind constants */
import { RIGHT_ARROW } from './arrow.constants';

const CLEAR_ROOM_TAG_FIRST = 0x01;
const CLEAR_ROOM_TAG_LAST = 0x13;
const CLEAR_ROOM_TAG_NAME = `clear enemies ${RIGHT_ARROW} doors open`;

export { CLEAR_ROOM_TAG_FIRST, CLEAR_ROOM_TAG_LAST, CLEAR_ROOM_TAG_NAME };
