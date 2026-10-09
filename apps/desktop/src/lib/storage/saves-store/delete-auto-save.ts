/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';

const deleteAutoSave = (p: string, id: string): Promise<void> => saves.deleteAutoSave(platformFiles(), p, id);

export { deleteAutoSave };
