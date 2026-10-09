/* @layer renderer-other @kind logic */
import { detectHost } from '@drizztdourden08/brock-core';
import type { ModulePorts } from '@drizztdourden08/brock-react';
import { createElectronControllerHost } from './electron/electron-controller-host';
import { createElectronDisplay } from './electron/electron-display';
import { createElectronFiles } from './electron/electron-files';
import { createElectronSprites } from './electron/electron-sprites';
import { createCapacitorWindowControls } from './hosts/capacitor/window-controls';
import { createCapacitorStorage } from './hosts/capacitor/storage';
import { createCapacitorFileStore } from './hosts/capacitor/file-store';
import { createCapacitorFilePicker } from './hosts/capacitor/file-picker';
import { createCapacitorControllerHost } from './hosts/capacitor/controller-host';
import { createCapacitorDevice } from './hosts/capacitor/device';
import { createCapacitorDisplay } from './hosts/capacitor/display';
import { createCapacitorSprites } from './hosts/capacitor/sprites';

const capacitorPorts = (): ModulePorts['web'] => ({
  window: createCapacitorWindowControls,
  storage: createCapacitorStorage,
  files: createCapacitorFileStore,
  filePicker: createCapacitorFilePicker,
  device: createCapacitorDevice,
  controllers: createCapacitorControllerHost,
  display: createCapacitorDisplay,
  sprites: createCapacitorSprites,
});

const rotpPorts = (): ModulePorts => ({
  electron: {
    files: createElectronFiles,
    controllers: createElectronControllerHost,
    display: createElectronDisplay,
    sprites: createElectronSprites,
  },
  web: detectHost() === 'capacitor' ? capacitorPorts() : {},
});

export { rotpPorts };
