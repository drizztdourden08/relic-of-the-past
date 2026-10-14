/* @layer renderer-lib @kind logic */
import type { AutoSaveInfo } from '@rotp/game-core';
import { autoSaves } from '../save-files';
import { platformFiles } from '../platform-files';

const listAutoSaves = (p: string): Promise<AutoSaveInfo[]> => autoSaves.list(platformFiles(), p);

export { listAutoSaves };
