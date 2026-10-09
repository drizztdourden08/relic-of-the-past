/* @layer renderer-lib @kind logic */
import type { NormalSaveInfo } from '@rotp/game-core';
import { saves } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const listNormalSaves = (p: string): Promise<NormalSaveInfo[]> => saves.listNormalSaves(platformFiles(), p);

export { listNormalSaves };
