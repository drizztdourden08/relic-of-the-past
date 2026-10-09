/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { normalSaves } from './normal-saves';

const loadNormalSave = (files: FileStore, p: string, id: string): Promise<Uint8Array | null> => normalSaves(files, p).load(id);

export { loadNormalSave };
