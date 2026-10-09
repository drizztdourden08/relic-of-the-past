/* @layer shared-game @kind logic */
import { MAX_HEART_CAP, STARTING_HEARTS } from './difficulty.constants';

const asHeartCap = (raw: number): number =>
  Math.min(MAX_HEART_CAP, Math.max(STARTING_HEARTS, Math.trunc(raw)));

export { asHeartCap };
