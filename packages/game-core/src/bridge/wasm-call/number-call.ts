/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from './call-when-running';
import type { CallArgs } from './wasm-call.type';

const numberCall = (exportName: string, fallback: number, call?: CallArgs): number =>
  callWhenRunning(fallback, (mod) => mod.ccall(exportName, 'number', call?.argTypes ?? [], call?.args ?? []));

export { numberCall };
