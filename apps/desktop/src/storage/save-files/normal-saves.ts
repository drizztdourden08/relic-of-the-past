/* @layer renderer-lib @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { NamedSaveEntry, SaveSlotRef } from '@drizztdourden08/brock-port-kit';
import type { NormalSaveInfo } from '@rotp/game-core';
import { createRotpSaveStore } from './rotp-save-store';
import type { SavePayload } from './save-files.type';
import { stateSize } from './state-size';

const refOf = (id: string): SaveSlotRef => ({ kind: 'normal', id });

const infoOf = (entry: NamedSaveEntry, size: number): NormalSaveInfo =>
  ({ id: entry.id, name: entry.name, timestamp: entry.savedAt, size, hasScreenshot: entry.hasScreenshot });

const storedInfoOf = async (files: FileStore, p: string, entry: NamedSaveEntry | null): Promise<NormalSaveInfo | null> => {
  const size = entry ? await stateSize(files, p, refOf(entry.id)) : null;
  return entry && size !== null ? infoOf(entry, size) : null;
};

const create = async (files: FileStore, p: string, name: string, { data, screenshot }: SavePayload): Promise<NormalSaveInfo> =>
  infoOf(await createRotpSaveStore(files).named.create(p, 'normal', name, { bytes: data, screenshot }), data.byteLength);

const list = async (files: FileStore, p: string): Promise<NormalSaveInfo[]> => {
  const entries = await createRotpSaveStore(files).named.details(p, 'normal');
  const infos = await Promise.all(entries.map((entry) => storedInfoOf(files, p, entry)));
  return infos.filter((info) => info !== null);
};

const overwrite = async (files: FileStore, p: string, id: string, { data, screenshot }: SavePayload): Promise<NormalSaveInfo | null> => {
  const entry = await createRotpSaveStore(files).named.overwrite(p, 'normal', id, { bytes: data, screenshot });
  return entry ? infoOf(entry, data.byteLength) : null;
};

const normalSaves = {
  create,
  list,
  overwrite,
  rename: async (files: FileStore, p: string, id: string, name: string): Promise<NormalSaveInfo | null> =>
    storedInfoOf(files, p, await createRotpSaveStore(files).named.rename(p, 'normal', id, name)),
  load: (files: FileStore, p: string, id: string): Promise<Uint8Array | null> => createRotpSaveStore(files).slots.read(p, refOf(id)),
  loadScreenshot: (files: FileStore, p: string, id: string): Promise<Uint8Array | null> =>
    createRotpSaveStore(files).slots.readScreenshot(p, refOf(id)),
  remove: (files: FileStore, p: string, id: string): Promise<void> => createRotpSaveStore(files).named.remove(p, 'normal', id),
};

export { normalSaves };
