/* @layer site-kit @kind logic */
import type { OptionalLockManager } from './browser-apis.type';

const optionalLockManager = (): OptionalLockManager => navigator.locks;

export { optionalLockManager };
