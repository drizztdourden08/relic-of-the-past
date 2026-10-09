/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';

const bombedWallsRegistry = {
  seeds: new Map<number, GridPos[]>(),
  opened: new Map<number, Set<string>>(),
};

export { bombedWallsRegistry };
