/* @layer bridge-wasm @kind logic */
import { readU8, callWhenRunning } from '../wasm-call';
import { phaseLabelFor } from './phase-label-for';
import type { GameProgressInfo } from './progress.type';

const wasmGetProgressIndicator = (): GameProgressInfo | null =>
  callWhenRunning<GameProgressInfo | null>(null, (mod) => {
    const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
    if (!progPtr) return null;
    const tier = readU8(mod.HEAPU8, progPtr);
    return { tier, label: phaseLabelFor(tier) };
  });

export { wasmGetProgressIndicator };
