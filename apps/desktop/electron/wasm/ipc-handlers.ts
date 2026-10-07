/* @layer electron-main @kind logic */
/**
 * Serves the WASM core bytes to the renderer. In the built app the renderer loads
 * over file://, where fetch() is blocked, so it asks the main process for the bytes
 * and instantiates them with the non-streaming WebAssembly.instantiate, which avoids
 * the instantiateStreaming renderer segfault. The path mirrors create-window's
 * loadFile('../renderer/index.html') anchor.
 */
import { join } from 'path';
import { readFile } from 'fs/promises';
import { handle } from '../lib/ipc/handle';
import { toArrayBuffer } from '../lib/buffer';

const WASM_PATH = join(__dirname, '../renderer/wasm/zelda3.wasm');

const registerWasmHandlers = (): void => {
  handle('wasm:readBytes', async () => toArrayBuffer(await readFile(WASM_PATH)));
};

export { registerWasmHandlers };
