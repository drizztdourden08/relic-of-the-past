/* @layer bridge-wasm @kind constants */
const QUADRANT_SUBMODULES: ReadonlySet<number> = new Set([1]);
const ROOM_SUBMODULES: ReadonlySet<number> = new Set([2]);
const DOOR_SUBMODULES: ReadonlySet<number> = new Set([4, 5, 9]);
const STAIR_SUBMODULES: ReadonlySet<number> = new Set([6, 8, 0x0E, 0x10, 0x11, 0x12, 0x13]);

const DUNGEON_MODULE = 7;
const SUBMODULE_NONE = 0;

export { QUADRANT_SUBMODULES, ROOM_SUBMODULES, DOOR_SUBMODULES, STAIR_SUBMODULES, DUNGEON_MODULE, SUBMODULE_NONE };
