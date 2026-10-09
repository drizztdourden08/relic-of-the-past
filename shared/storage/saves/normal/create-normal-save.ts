/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import type { NormalSaveInfo } from '@shared/types/saves';
import { newId } from '../../id';
import type { NormalEntry } from '../saves.type';
import { normalSaves } from './normal-saves';

const createNormalSave = async (files: FileStore, p: string, name: string, data: Uint8Array, screenshot?: Uint8Array): Promise<NormalSaveInfo> => {
  const entry: NormalEntry = { id: newId(), name, timestamp: Date.now() };
  await normalSaves(files, p).append(entry, data, screenshot);
  return { id: entry.id, name, timestamp: entry.timestamp, size: data.byteLength, hasScreenshot: !!screenshot };
};

export { createNormalSave };
