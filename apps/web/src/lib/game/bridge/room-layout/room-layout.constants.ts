/* @layer bridge-wasm @kind constants */
import type { RoomShape } from './room-layout.type';

const LAYOUT_SHAPES: Array<RoomShape> = ['2x2', '2x2', '2x1', '2x1', '1x2', '1x2', '1x1', '1x1'];
const NOT_MERGED_BY_BLASTWALL = 0;
const FIRST_BASEMENT_FLOOR_RAW = 128;
const BYTE_RANGE = 256;

export { LAYOUT_SHAPES, NOT_MERGED_BY_BLASTWALL, FIRST_BASEMENT_FLOOR_RAW, BYTE_RANGE };
