/* @layer bridge-wasm @kind logic */
import { readOamRing } from '../oam-ring';
import { readOamSnapshot } from '../oam-snapshot';
import type { EmscriptenModule } from '../types';

const exposeDebugHandles = (module: EmscriptenModule): void => {
  Object.assign(window, {
    __zelda3Module: module,
    __oamSnapshot: readOamSnapshot,
    __oamRing: readOamRing,
  });
};

export { exposeDebugHandles };
