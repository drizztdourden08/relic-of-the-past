/* @layer bridge-wasm @kind logic */
import { bombedWallsRegistry } from './bombed-walls-registry';

const resetBombedWalls = (): void => {
  bombedWallsRegistry.seeds.clear();
  bombedWallsRegistry.opened.clear();
};

export { resetBombedWalls };
