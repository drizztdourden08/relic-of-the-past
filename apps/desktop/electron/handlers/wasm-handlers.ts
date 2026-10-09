/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerWasmHandlers } from '../wasm/ipc-handlers';

const wasmHandlers: HandlerGroup = {
  id: 'wasm',
  register: () => {
    registerWasmHandlers();
  },
};

export { wasmHandlers };
