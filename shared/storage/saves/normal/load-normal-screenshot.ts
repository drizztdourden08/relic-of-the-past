/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { normalSaves } from './normal-saves';

const loadNormalScreenshot = (files: FileStore, p: string, id: string): Promise<Uint8Array | null> =>
  normalSaves(files, p).loadScreenshot(id);

export { loadNormalScreenshot };
