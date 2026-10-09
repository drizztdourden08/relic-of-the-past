/* @layer electron-main @kind constants */
import { join } from 'path';

const WASM_PATH = join(__dirname, '../renderer/wasm/zelda3.wasm');

export { WASM_PATH };
