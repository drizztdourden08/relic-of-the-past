/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { handle, toArrayBuffer } from '@drizztdourden08/brock-electron/main';
import { WASM_PATH } from './ipc-handlers.constants';

const registerWasmHandlers = (): void => {
  handle('wasm:readBytes', async () => toArrayBuffer(await readFile(WASM_PATH)));
};

export { registerWasmHandlers };
