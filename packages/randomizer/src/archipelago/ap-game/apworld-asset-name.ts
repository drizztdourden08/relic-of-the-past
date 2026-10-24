/* @layer shared-game @kind logic */
import { WORLD_MODULE_NAME } from './ap-game.constants';

/** The release asset that carries the world package for one Archipelago version. */
const apworldAssetName = (apVersion: string): string => `${WORLD_MODULE_NAME}-ap${apVersion}.apworld`;

export { apworldAssetName };
