/* @layer bridge-wasm @kind logic */
import type { TitleFrame } from '@shared/game/title/title-frame.type';
import { callPtr } from '../wasm-call';
import { decodeTitleFrame } from './decode-title-frame';

const wasmGetTitleFrame = (): TitleFrame | null => callPtr('WasmGetTitleFrame', (mod, ptr) => decodeTitleFrame(mod.HEAPU8, ptr));

export { wasmGetTitleFrame };
