/* @layer shared-platform @kind types */
import type { PlatformInfo, Capabilities } from './platform-info.type';
import type { WindowControlsPort } from './ports/window-controls.type';
import type { StoragePort } from './ports/storage.type';
import type { FileStore } from './ports/file-store.type';
import type { FilePickerPort } from './ports/file-picker.type';
import type { ControllerHost } from './ports/controller-host.type';
import type { DevicePort } from './ports/device.type';
import type { DisplayPort } from './ports/display.type';

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
