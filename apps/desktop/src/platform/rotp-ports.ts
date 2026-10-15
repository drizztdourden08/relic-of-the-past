/* @layer renderer-other @kind logic */
import type { ModulePorts } from '@drizztdourden08/brock-react';
import { createElectronFiles } from './electron/electron-files';
import { createElectronSprites } from './electron/electron-sprites';
import { createCapacitorSprites } from './hosts/capacitor/sprites';

const rotpPorts = (): ModulePorts => ({
  electron: {
    files: createElectronFiles,
    sprites: createElectronSprites,
  },
  capacitor: {
    sprites: createCapacitorSprites,
  },
});

export { rotpPorts };
