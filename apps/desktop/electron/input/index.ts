/* @layer electron-main @kind barrel */
/**
 * Input subsystem entry point for the main process.
 */

export { registerInputHandlers, stopInputHandlers } from './ipc-handlers';
export { sdl3Source } from './sdl3-source';
export { loadMappingDatabases, addUserMapping } from './mapping-db';
