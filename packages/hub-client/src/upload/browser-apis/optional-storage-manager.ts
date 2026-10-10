/* @layer site-kit @kind logic */
import type { OptionalStorageManager } from './browser-apis.type';

const optionalStorageManager = (): OptionalStorageManager => navigator.storage;

export { optionalStorageManager };
