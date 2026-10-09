/* @layer bridge-wasm @kind constants */
const MAX_DOORWAY_SPAN = 12;

const WARP_DOOR = 0x46;
const THRONE_DOOR = 0x14;

const BLOCKED_SPREAD = 4;

const DEFAULT_MID = 32;

const FLOOD_ENTRANCE_PREFIXES: readonly string[] = ['ent', 'hole', 'stair', 'bound'];

export { MAX_DOORWAY_SPAN, WARP_DOOR, THRONE_DOOR, BLOCKED_SPREAD, DEFAULT_MID, FLOOD_ENTRANCE_PREFIXES };
