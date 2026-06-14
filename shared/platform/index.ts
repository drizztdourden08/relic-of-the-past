/* @layer shared-platform @kind barrel */
export { detectHost, osFromProcess } from './detect';
export { createPlatform, resolvePlatform } from './platform';

export type { HostShell, OsKind, FormFactor, InputModel, PlatformInfo, Capabilities } from './types';
export type { WindowControlsPort, Unsub } from './ports/window-controls';
export type { PlatformFactory } from './factory';
export type { Platform, FactoryMap } from './platform';
