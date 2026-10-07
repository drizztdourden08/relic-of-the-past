/* @layer bridge-wasm @kind logic */
/**
 * The DeathLink kill: asks the core to take Link's life when another player in the room
 * died. Guarded like every optional export: a core built before `WasmApKillLink` existed
 * answers 'unsupported' and the death is only logged.
 *
 * The core drops a kill that arrives while its death module runs (death_link.c), so the same
 * test is made here first to say so: 'down' is a kill that did nothing because Link is
 * already dying or at the game over.
 */
import { getModule, wasmGetGameUIState } from '../wasm-bridge';

const KILL_EXPORT = 'WasmApKillLink';
/** The core's MODULE_GAME_OVER (game_constants.h), the first byte of the UI state buffer. */
const MODULE_GAME_OVER = 18;

type KillOutcome = 'armed' | 'down' | 'unsupported';

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

export { KILL_EXPORT, killLinkInCore };
export type { KillOutcome };
