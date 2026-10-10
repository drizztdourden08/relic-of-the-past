/* @layer renderer-components @kind logic */
import { LEDGE_STATE_MAX, LEDGE_STATE_MIN } from './pathfinding.constants';

const isLedgeState = (state: number): boolean => state >= LEDGE_STATE_MIN && state <= LEDGE_STATE_MAX;

export { isLedgeState };
