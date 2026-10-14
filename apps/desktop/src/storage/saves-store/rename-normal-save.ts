/* @layer renderer-lib @kind logic */
import type { NormalSaveInfo } from '@rotp/game-core';
import { normalSaves } from '../save-files';
import { platformFiles } from '../platform-files';

const renameNormalSave = (p: string, id: string, newName: string): Promise<NormalSaveInfo | null> =>
  normalSaves.rename(platformFiles(), p, id, newName);

export { renameNormalSave };
