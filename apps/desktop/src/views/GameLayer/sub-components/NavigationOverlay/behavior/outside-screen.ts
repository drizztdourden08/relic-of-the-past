/* @layer renderer-components @kind logic */
import { SCREEN_TILES } from '../sub-components/TileInspector.constants';

const outsideScreen = (row: number, col: number): boolean => row < 0 || row >= SCREEN_TILES || col < 0 || col >= SCREEN_TILES;

export { outsideScreen };
