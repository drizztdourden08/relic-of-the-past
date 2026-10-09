/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { autoSaves } from './auto-saves';

const loadAutoSave = (files: FileStore, p: string, id: string): Promise<Uint8Array | null> => autoSaves(files, p).load(id);

export { loadAutoSave };
