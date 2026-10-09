/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { NormalSaveInfo } from '@shared/types/saves';
import { normalSaves } from './normal-saves';

const listNormalSaves = async (files: FileStore, p: string): Promise<NormalSaveInfo[]> =>
  (await normalSaves(files, p).valid()).map((v) => ({ id: v.entry.id, name: v.entry.name, timestamp: v.entry.timestamp, size: v.bytes, hasScreenshot: v.hasScreenshot }));

export { listNormalSaves };
