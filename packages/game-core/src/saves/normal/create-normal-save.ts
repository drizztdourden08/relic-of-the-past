/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { NormalSaveInfo } from '../../save-types';
import { newId } from '@drizztdourden08/brock-core';
import type { NormalEntry, SavePayload } from '../saves.type';
import { normalSaves } from './normal-saves';

const createNormalSave = async (files: FileStore, p: string, name: string, payload: SavePayload): Promise<NormalSaveInfo> => {
  const { data, screenshot } = payload;
  const entry: NormalEntry = { id: newId(), name, timestamp: Date.now() };
  await normalSaves(files, p).append(entry, data, screenshot);
  return { id: entry.id, name, timestamp: entry.timestamp, size: data.byteLength, hasScreenshot: Boolean(screenshot) };
};

export { createNormalSave };
