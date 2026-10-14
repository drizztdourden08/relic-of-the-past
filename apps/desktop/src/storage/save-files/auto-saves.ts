/* @layer renderer-lib @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { NamedSaveEntry, SaveSlotRef } from '@drizztdourden08/brock-port-kit';
import type { AutoSaveInfo } from '@rotp/game-core';
import { manifestRecords } from './manifest-codec/manifest-records';
import { createRotpSaveStore } from './rotp-save-store';
import { AUTO_ABS_MAX, AUTO_DEFAULT_MAX } from './save-files.constants';
import type { AutoTrigger, SavePayload } from './save-files.type';
import { stateSize } from './state-size';

const refOf = (id: string): SaveSlotRef => ({ kind: 'auto', id });

const infoOf = (entry: NamedSaveEntry, size: number): AutoSaveInfo => ({
  id: entry.id,
  timestamp: entry.savedAt,
  size,
  trigger: manifestRecords.metaTriggerOf(entry.meta),
  hasScreenshot: entry.hasScreenshot,
});

const create = async (files: FileStore, p: string, trigger: AutoTrigger, { data, screenshot }: SavePayload): Promise<AutoSaveInfo> =>
  infoOf(await createRotpSaveStore(files).named.create(p, 'auto', trigger, { bytes: data, screenshot, meta: { trigger } }), data.byteLength);

const list = async (files: FileStore, p: string): Promise<AutoSaveInfo[]> => {
  const entries = await createRotpSaveStore(files).named.details(p, 'auto');
  const infos = await Promise.all(entries.map(async (entry) => {
    const size = await stateSize(files, p, refOf(entry.id));
    return size === null ? null : infoOf(entry, size);
  }));
  return infos.filter((info) => info !== null);
};

const prune = async (files: FileStore, p: string, maxEntries?: number): Promise<void> => {
  await createRotpSaveStore(files).named.prune(p, 'auto', { keep: Math.min(maxEntries ?? AUTO_DEFAULT_MAX, AUTO_ABS_MAX) });
};

const autoSaves = {
  create,
  list,
  prune,
  load: (files: FileStore, p: string, id: string): Promise<Uint8Array | null> => createRotpSaveStore(files).slots.read(p, refOf(id)),
  loadScreenshot: (files: FileStore, p: string, id: string): Promise<Uint8Array | null> =>
    createRotpSaveStore(files).slots.readScreenshot(p, refOf(id)),
  remove: (files: FileStore, p: string, id: string): Promise<void> => createRotpSaveStore(files).named.remove(p, 'auto', id),
};

export { autoSaves };
