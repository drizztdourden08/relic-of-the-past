/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';

const deleteNormalSave = (p: string, id: string): Promise<void> => saves.deleteNormalSave(platformFiles(), p, id);

export { deleteNormalSave };
