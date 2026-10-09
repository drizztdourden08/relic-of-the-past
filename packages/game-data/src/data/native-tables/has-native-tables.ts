/* @layer shared-game @kind logic */
import { OVERWORLD_TILE_ATTRS } from './tile-tables.constants';

const hasNativeTables = (): boolean => Object.keys(OVERWORLD_TILE_ATTRS).length > 0;

export { hasNativeTables };
