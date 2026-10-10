/* @layer bridge-wasm @kind logic */
import { getModule, wasmGetGameUIState } from '@rotp/game-core';
import { KILL_EXPORT, MODULE_GAME_OVER } from './ap-kill-link.constants';
import type { KillOutcome } from './ap-kill-link.type';

const isLinkDown = (): boolean => {
  const state = wasmGetGameUIState();
  return state !== null && state.heap[state.ptr] === MODULE_GAME_OVER;
};

const hasKillExport = (mod: object): boolean => {
  const exported: unknown = Reflect.get(mod, `_${KILL_EXPORT}`);
  return typeof exported === 'function';
};

const killLinkInCore = (): KillOutcome => {
  const mod = getModule();
  if (!mod || !hasKillExport(mod)) return 'unsupported';
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
