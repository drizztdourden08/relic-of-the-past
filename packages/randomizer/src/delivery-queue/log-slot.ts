/* @layer bridge-wasm @kind logic */
import type { RandomizerLog } from '@drizztdourden08/brock-randomizer';

const logSlot: { current: RandomizerLog } = { current: () => undefined };

export { logSlot };
