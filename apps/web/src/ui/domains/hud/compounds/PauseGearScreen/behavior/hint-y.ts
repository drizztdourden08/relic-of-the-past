/* @layer renderer-hud @kind logic */
import { BOX_FRAME, TILE } from '../PauseGearScreen.constants';
import { gearContentHeight } from './gear-content-height';

const hintY = (rows: number): number => gearContentHeight(rows) + BOX_FRAME + TILE / 2;

export { hintY };
