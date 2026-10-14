/* @layer renderer-other @kind logic */
import type { ModulePorts } from '@drizztdourden08/brock-react';
import { createElectronFiles } from './electron/electron-files';
import { createElectronSprites } from './electron/electron-sprites';
import { createCapacitorBackEdge } from './hosts/capacitor/back-edge';
import { createCapacitorStorage } from './hosts/capacitor/storage';
import { createCapacitorFilePicker } from './hosts/capacitor/file-picker';
import { createCapacitorSprites } from './hosts/capacitor/sprites';

const rotpPorts = (): ModulePorts => ({
  electron: {
    files: createElectronFiles,
    sprites: createElectronSprites,
  },
  capacitor: {
    storage: createCapacitorStorage,
    filePicker: createCapacitorFilePicker,
    sprites: createCapacitorSprites,
    backEdge: createCapacitorBackEdge,
  },
});

export { rotpPorts };
