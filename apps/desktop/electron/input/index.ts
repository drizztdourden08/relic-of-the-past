/* @layer electron-main @kind barrel */
/**
 * Input subsystem — main process entry point.
 */

export { registerInputHandlers, stopInputHandlers } from './ipc-handlers';
export { sdl3Source } from './sdl3-source';
export { loadMappingDatabases, addUserMapping } from './mapping-db';
