/* @layer renderer-app @kind logic */
import { getGameState, subscribeGameState } from '@rotp/game-core';
import type { CoreSignal } from '@drizztdourden08/brock-randomizer';

const rotpCoreSignal: CoreSignal = {
  state: () => getGameState(),
  subscribe: (fn) => subscribeGameState(() => fn()),
};

export { rotpCoreSignal };
