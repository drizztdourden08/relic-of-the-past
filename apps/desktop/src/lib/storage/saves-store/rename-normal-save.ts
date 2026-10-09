/* @layer renderer-lib @kind logic */
import type { NormalSaveInfo } from '@rotp/game-core';
import { saves } from '@rotp/game-core';
import { platformFiles } from '../platform-files';

const renameNormalSave = (p: string, id: string, newName: string): Promise<NormalSaveInfo | null> =>
  saves.renameNormalSave(platformFiles(), p, id, newName);

export { renameNormalSave };
