/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { normalSaves } from './normal-saves';

const deleteNormalSave = (files: FileStore, p: string, id: string): Promise<void> => normalSaves(files, p).remove(id);

export { deleteNormalSave };
