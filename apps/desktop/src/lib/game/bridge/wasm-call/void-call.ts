/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from './call-when-running';
import type { CallArgs } from './wasm-call.type';

const voidCall = (exportName: string, call?: CallArgs): void =>
  callWhenRunning<void>(undefined, (mod) => {
    mod.ccall(exportName, null, call?.argTypes ?? [], call?.args ?? []);
  });

export { voidCall };
