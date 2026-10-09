/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { autoSaves } from './auto-saves';

const deleteAutoSave = (files: FileStore, p: string, id: string): Promise<void> => autoSaves(files, p).remove(id);

export { deleteAutoSave };
