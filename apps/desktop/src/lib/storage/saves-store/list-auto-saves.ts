/* @layer renderer-lib @kind logic */
import type { AutoSaveInfo } from '@rotp/game-core';
import { saves } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const listAutoSaves = (p: string): Promise<AutoSaveInfo[]> => saves.listAutoSaves(platformFiles(), p);

export { listAutoSaves };
