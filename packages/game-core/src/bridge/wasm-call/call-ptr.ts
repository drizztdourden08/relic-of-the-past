/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../../types';
import { callWhenRunning } from './call-when-running';
import type { CallArgs } from './wasm-call.type';

const callPtr = <T>(exportName: string, fromPtr: (mod: EmscriptenModule, ptr: number) => T | null, call?: CallArgs): T | null =>
  callWhenRunning<T | null>(null, (mod) => {
    const ptr = mod.ccall(exportName, 'number', call?.argTypes ?? [], call?.args ?? []);
    if (!ptr) return null;
    return fromPtr(mod, ptr);
  });

export { callPtr };
