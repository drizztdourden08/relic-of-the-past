/* @layer shared-game @kind logic */
import { Q4_STEPS_PER_UNIT } from './pacing.constants';

const toQ4 = (stop: number): number => Math.round(stop * Q4_STEPS_PER_UNIT);

export { toQ4 };
