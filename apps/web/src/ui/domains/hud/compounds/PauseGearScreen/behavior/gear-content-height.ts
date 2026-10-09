/* @layer renderer-hud @kind logic */
import { ROW_PITCH, TIER_SIZE } from '../PauseGearScreen.constants';

const gearContentHeight = (rows: number): number =>
  Math.max(rows - 1, 0) * ROW_PITCH + TIER_SIZE;

export { gearContentHeight };
