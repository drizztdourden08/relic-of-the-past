/* @layer renderer-hud @kind logic */
import { TILE } from '../PauseGearScreen.constants';
import { gearContentHeight } from './gear-content-height';

const gearBoxRows = (rows: number): number => gearContentHeight(rows) / TILE;

export { gearBoxRows };
