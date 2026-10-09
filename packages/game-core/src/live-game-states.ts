/* @layer bridge-wasm @kind logic */
import { wasmReadFlagSnapshot } from './bridge/sim-queries/wasm-read-flag-snapshot';
import { wasmGetPlayerStateInfo } from './bridge/player-state';
import { activeStates, SLOT } from './active-states';
import { playerStates } from './player-state-rules';
import type { ActiveState } from './active-states';

const liveGameStates = (): ActiveState[] => {
  const snapshot = wasmReadFlagSnapshot();
  const sramProgressStates = snapshot
    ? activeStates({ follower: snapshot.progress[SLOT.follower] ?? 0, progress: snapshot.progress })
    : [];
  return [...sramProgressStates, ...playerStates(wasmGetPlayerStateInfo())];
};

export { liveGameStates };
