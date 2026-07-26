/* @layer shared-platform @kind logic */
/**
 * Platform facade + composition root. resolvePlatform() is the single Strategy
 * selection point: detect the host once, instantiate that host's factory, and
 * assemble the facade the app consumes. The facade deliberately does NOT expose
 * the legacy window.api — not-yet-ported call sites keep using it directly.
 */
import type { PlatformInfo, Capabilities, HostShell } from './types';
import type { WindowControlsPort } from './ports/window-controls';
import type { StoragePort } from './ports/storage';
import type { FileStore } from './ports/file-store';
import type { FilePickerPort } from './ports/file-picker';
import type { ControllerHost } from './ports/controller-host';
import type { DevicePort } from './ports/device';
import type { DisplayPort } from './ports/display';
import type { PlatformFactory } from './factory';
import { detectHost } from './detect';

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

const createPlatform = (factory: PlatformFactory): Platform => ({
  info: factory.info,
  capabilities: factory.capabilities,
  window: factory.createWindowControls(),
  storage: factory.createStorage(),
  files: factory.createFileStore(),
  filePicker: factory.createFilePicker(),
  controllers: factory.createControllerHost(),
  device: factory.createDevice(),
  display: factory.createDisplay(),
});

const resolvePlatform = (factories: FactoryMap): Platform => {
  const host = detectHost();
  const make = factories[host] ?? factories.web ?? factories.electron;
  if (!make) throw new Error(`No platform factory registered for host "${host}"`);
  return createPlatform(make());
};

export type { Platform, FactoryMap };
export { createPlatform, resolvePlatform };
