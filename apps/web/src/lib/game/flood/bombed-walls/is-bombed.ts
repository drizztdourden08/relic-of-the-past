/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import { bombedWallsRegistry } from './bombed-walls-registry';
import { cellKey } from './cell-key';

const isBombed = (roomId: number, tile: GridPos): boolean =>
  bombedWallsRegistry.opened.get(roomId)?.has(cellKey(tile.row, tile.col)) === true;

export { isBombed };
