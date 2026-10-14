/* @layer renderer-lib @kind logic */
import type { NormalSaveInfo } from '@rotp/game-core';
import { normalSaves } from '../save-files';
import { platformFiles } from '../platform-files';

const listNormalSaves = (p: string): Promise<NormalSaveInfo[]> => normalSaves.list(platformFiles(), p);

export { listNormalSaves };
