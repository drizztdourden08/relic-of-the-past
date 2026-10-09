/* @layer renderer-lib @kind logic */
import type { NormalSaveInfo } from '@shared/types/saves';
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';

const renameNormalSave = (p: string, id: string, newName: string): Promise<NormalSaveInfo | null> =>
  saves.renameNormalSave(platformFiles(), p, id, newName);

export { renameNormalSave };
