/* @layer shared-platform @kind logic */
import type { PlatformFactory } from './factory.type';
import type { Platform } from './platform.type';

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

export { createPlatform };
