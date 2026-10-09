/* @layer bridge-wasm @kind logic */
import { getModule, wasmGetGameUIState } from '../wasm-bridge';
import { KILL_EXPORT, MODULE_GAME_OVER } from './ap-kill-link.constants';
import type { KillOutcome } from './ap-kill-link.type';

const isLinkDown = (): boolean => {
  const state = wasmGetGameUIState();
  return state !== null && state.heap[state.ptr] === MODULE_GAME_OVER;
};

const killLinkInCore = (): KillOutcome => {
  const mod = getModule();
  const exports = mod as unknown as Record<string, unknown> | null;
  if (!mod || typeof exports?.[`_${KILL_EXPORT}`] !== 'function') return 'unsupported';
  if (isLinkDown()) return 'down';
  try {
    mod.ccall(KILL_EXPORT, null, [], []);
    return 'armed';
  } catch {
    return 'unsupported';
  }
};

export { killLinkInCore };
export type { KillOutcome } from './ap-kill-link.type';
