/* @layer bridge-wasm @kind logic */
import type { CheckId } from '@rotp/game-data';

const collectedChecksState: { collected: Set<CheckId> } = { collected: new Set<CheckId>() };

export { collectedChecksState };
