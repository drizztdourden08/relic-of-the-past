/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import { bombedWallsRegistry } from './bombed-walls-registry';

const markBombed = (roomId: number, tile: GridPos): void => {
  const { seeds } = bombedWallsRegistry;
  seeds.set(roomId, [...(seeds.get(roomId) ?? []), tile]);
};

export { markBombed };
