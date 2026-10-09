/* @layer bridge-wasm @kind logic */
import type { CheckId } from '@shared/game/data';
import { trackerState } from './tracker-state';

const getEventStatus = (): ReadonlyMap<CheckId, boolean> => trackerState.currentEventStatus;

export { getEventStatus };
