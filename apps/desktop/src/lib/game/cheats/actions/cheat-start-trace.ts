/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';
import { getModule } from '../../wasm-bridge';
import { DEFAULT_TRACE_FRAMES } from '../cheats.constants';

const cheatStartTrace = (frames = DEFAULT_TRACE_FRAMES): void => voidCall('WasmCheatStartTrace', numArgs(frames));

const consoleTrace = (frames = DEFAULT_TRACE_FRAMES): void => {
  const mod = getModule();
  if (!mod) { console.warn('WASM not loaded'); return; }
  mod.ccall('WasmCheatStartTrace', null, ['number'], [frames]);
  console.log(`[Trace] Recording ${frames} frames. Check console for [TRACE] output`);
};

if (typeof window !== 'undefined') Object.assign(window, { __trace: consoleTrace });

export { cheatStartTrace };
