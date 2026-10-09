/* @layer bridge-wasm @kind constants */
const ROOM_EXIT_UNREACHED = 0xffff;
const OUTSIDE_ORIGINS: ReadonlySet<string> = new Set(['room-door', 'exit-table']);

export { ROOM_EXIT_UNREACHED, OUTSIDE_ORIGINS };
