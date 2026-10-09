/* @layer bridge-wasm @kind logic */
import type { CheckId } from '@rotp/game-data';
import { trackerState } from './tracker-state';

const getCompletedChecks = (): Set<CheckId> => trackerState.currentCompletedChecks;

export { getCompletedChecks };
