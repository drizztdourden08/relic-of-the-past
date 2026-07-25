/* @layer bridge-wasm @kind logic */
/**
 * Reads the live flag snapshot and hands it to the state registry.
 *
 * Split from `active-states.ts` so the rules stay pure (and unit-testable with a
 * plain object) while the WASM read lives on this side of the line.
 */
import { wasmReadFlagSnapshot, wasmGetPlayerStateInfo } from './index';
import { activeStates, SLOT } from './active-states';
import { playerStates } from './player-state-rules';
import type { ActiveState } from './active-states';

/**
 * Two sources, one list: SRAM progress (follower, story beats, keys) and live
 * player-state bytes (what the player is doing, named progress bits).
 */
const liveGameStates = (): ActiveState[] => {
  const snapshot = wasmReadFlagSnapshot();
  const sram = snapshot
    ? activeStates({ follower: snapshot.progress[SLOT.follower] ?? 0, progress: snapshot.progress })
    : [];
  return [...sram, ...playerStates(wasmGetPlayerStateInfo())];
};

export { liveGameStates };
