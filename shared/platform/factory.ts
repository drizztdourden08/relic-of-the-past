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
import type { FilePickerPort } from './ports/file-picker';
import type { ControllerHost } from './ports/controller-host';
import type { DevicePort } from './ports/device';
import type { DisplayPort } from './ports/display';

interface PlatformFactory {
  readonly info: PlatformInfo;
  readonly capabilities: Capabilities;
  createWindowControls: () => WindowControlsPort;
  createStorage: () => StoragePort;
  createFileStore: () => FileStore;
  createFilePicker: () => FilePickerPort;
  createControllerHost: () => ControllerHost;
  createDevice: () => DevicePort;
  createDisplay: () => DisplayPort;
}

export type { PlatformFactory };
