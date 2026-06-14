/* @layer shared-platform @kind logic */
/**
 * Abstract Factory contract. Each host (Electron, Capacitor, web) implements one
 * PlatformFactory that builds a consistent family of capability adapters. Ports
 * are added here as they are carved out of the legacy window.api surface.
 */
import type { PlatformInfo, Capabilities } from './types';
import type { WindowControlsPort } from './ports/window-controls';
import type { StoragePort } from './ports/storage';
import type { FileStore } from './ports/file-store';

interface PlatformFactory {
  readonly info: PlatformInfo;
  readonly capabilities: Capabilities;
  createWindowControls: () => WindowControlsPort;
  createStorage: () => StoragePort;
  createFileStore: () => FileStore;
  // future: createControllerHost, createDialogs, …
}

export type { PlatformFactory };
