/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { handle } from '../lib/ipc/handle';
import { toArrayBuffer } from '../lib/buffer';
import { WASM_PATH } from './ipc-handlers.constants';

const registerWasmHandlers = (): void => {
  handle('wasm:readBytes', async () => toArrayBuffer(await readFile(WASM_PATH)));
};

export { registerWasmHandlers };
