/* @layer shared-platform @kind logic */
/**
 * Abstract Factory contract. Each host (Electron, Capacitor, web) implements one
 * PlatformFactory that builds a consistent family of capability adapters. Ports
 * are added here as they are carved out of the legacy window.api surface.
 */
import type { PlatformInfo, Capabilities } from './types';
import type { WindowControlsPort } from './ports/window-controls';

interface PlatformFactory {
  readonly info: PlatformInfo;
  readonly capabilities: Capabilities;
  createWindowControls: () => WindowControlsPort;
  // future: createFileStore, createControllerHost, createDialogs, …
}

export type { PlatformFactory };
