/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { autoSaves } from './auto-saves';

const deleteAutoSave = (files: FileStore, p: string, id: string): Promise<void> => autoSaves(files, p).remove(id);

export { deleteAutoSave };
