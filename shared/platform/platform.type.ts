/* @layer shared-platform @kind types */
import type { PlatformInfo, Capabilities, HostShell } from './platform-info.type';
import type { WindowControlsPort } from './ports/window-controls.type';
import type { StoragePort } from './ports/storage.type';
import type { FileStore } from './ports/file-store.type';
import type { FilePickerPort } from './ports/file-picker.type';
import type { ControllerHost } from './ports/controller-host.type';
import type { DevicePort } from './ports/device.type';
import type { DisplayPort } from './ports/display.type';
import type { PlatformFactory } from './factory.type';

interface Platform {
  info: PlatformInfo;
  capabilities: Capabilities;
  window: WindowControlsPort;
  storage: StoragePort;
  files: FileStore;
  filePicker: FilePickerPort;
  controllers: ControllerHost;
  device: DevicePort;
  display: DisplayPort;
}

type FactoryMap = Partial<Record<HostShell, () => PlatformFactory>>;

export type { Platform, FactoryMap };
